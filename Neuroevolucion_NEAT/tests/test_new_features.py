"""
Pruebas para las nuevas caracteristicas implementadas:
- Normalizacion con tanh en lugar de recorte duro.
- Mutacion de parametros de trading con perturbaciones gaussianas pequenas y reflexion.
- Desactivacion de cortos en spot (allow_short=False).
- Metricas de seleccion anti-sobreajuste (selection_score).
- Encadenamiento OOS corregido (chain_equities).
- Benchmarks causales (Buy & Hold y cruce de SMAs).
"""

import numpy as np
import pandas as pd
import pytest

from src.data.normalizer import RollingNormalizer
from src.evolution.evaluation import selection_score
from src.evolution.engine import chain_equities
from src.neat.genome import Genome, TradingParams
from src.neat.reproduction import mutate_trading_param, _reflect_into_range
from src.trading.backtester import Backtester
from src.trading.benchmarks import buy_and_hold, sma_crossover
from src.trading.position import Position, PositionType
from src.trading.metrics import compute_metrics
from tests.helpers import make_genome, make_prices, patch_network, signal_outputs


def test_tanh_normalizer_preserves_extremes():
    """tanh squash no aplana outliers a un mismo valor como hacia el recorte duro."""
    norm_tanh = RollingNormalizer(window=10, method="zscore", squash="tanh", tanh_scale=2.0)
    norm_clip = RollingNormalizer(window=10, method="zscore", squash="clip", clip_value=1.0)

    # Base con varianza natural (std > 0)
    base = [9.8, 10.2, 9.9, 10.1, 10.0, 9.9, 10.1, 10.0, 9.8, 10.2]
    df1 = pd.DataFrame({"val": base + [11.5]})
    df2 = pd.DataFrame({"val": base + [15.0]})

    clip1 = norm_clip.normalize(df1)["val"].iloc[-1]
    clip2 = norm_clip.normalize(df2)["val"].iloc[-1]

    tanh1 = norm_tanh.normalize(df1)["val"].iloc[-1]
    tanh2 = norm_tanh.normalize(df2)["val"].iloc[-1]

    # En clip a 1.0, ambos superan 1 std y saturan a 1.0 (se aplanan al mismo valor)
    assert clip1 == pytest.approx(1.0)
    assert clip2 == pytest.approx(1.0)

    # En tanh, ninguno satura a 1.0 y el outlier mayor produce un valor mayor
    assert abs(tanh1) < 1.0
    assert abs(tanh2) < 1.0
    assert tanh2 > tanh1


def test_trading_param_reflection():
    """Valores fuera del rango se reflejan suavemente hacia el interior."""
    # Rango [0.01, 0.15] (span = 0.14)
    # Valor que se pasa por arriba: 0.16 -> 0.15 - 0.01 = 0.14
    assert _reflect_into_range(0.16, 0.01, 0.15) == pytest.approx(0.14)
    # Valor que se pasa por abajo: 0.00 -> 0.01 + 0.01 = 0.02
    assert _reflect_into_range(0.00, 0.01, 0.15) == pytest.approx(0.02)
    # Valor dentro del rango no cambia
    assert _reflect_into_range(0.05, 0.01, 0.15) == pytest.approx(0.05)


def test_mutate_trading_param_small_perturbation():
    """La mutacion realiza cambios pequenos proporcionales al rango y respeta los limites."""
    genome = make_genome(stop_loss=0.05)
    for _ in range(50):
        mutate_trading_param(genome, "stop_loss", 0.01, 0.15, relative_std=0.05)
        val = genome.trading_params.stop_loss
        assert 0.01 <= val <= 0.15


def test_backtester_spot_disallows_short(monkeypatch):
    """allow_short=False convierte señales bajistas en efectivo (CASH) para spot."""
    n = 30
    opens = np.full(n, 100.0)
    df = make_prices(opens)
    patch_network(monkeypatch, signal_outputs(n, short_bars=range(5, 20)))

    bt_no_short = Backtester(initial_capital=100000.0, allow_short=False, min_trades=1)
    _, _, _, trades_no_short = bt_no_short.evaluate_genome(make_genome(), df, ["ind0", "ind1"])
    assert len(trades_no_short) == 0

    bt_with_short = Backtester(initial_capital=100000.0, allow_short=True, min_trades=1)
    _, _, _, trades_with_short = bt_with_short.evaluate_genome(make_genome(), df, ["ind0", "ind1"])
    assert len(trades_with_short) > 0


def test_selection_score_anti_overfitting():
    """selection_score('min') penaliza candidatos con validacion inflada pero mal train."""
    # Candidato A: train=2.0, val=0.5
    # Candidato B: train=1.2, val=1.1
    score_a = selection_score(train_fitness=0.2, val_fitness=1.5, metric="min")
    score_b = selection_score(train_fitness=1.0, val_fitness=0.9, metric="min")
    assert score_b > score_a  # B es mas consistente y robusto


def test_chain_equities():
    """chain_equities encadena retornos preservando la primera barra de cada ventana."""
    idx1 = pd.date_range("2020-01-01", periods=3, freq="D")
    idx2 = pd.date_range("2020-01-04", periods=3, freq="D")

    eq1 = pd.Series([100.0, 110.0, 121.0], index=idx1)
    eq2 = pd.Series([100.0, 105.0, 110.25], index=idx2)

    chained = chain_equities([eq1, eq2], initial_capital=100.0)
    assert len(chained) == 6
    assert chained.iloc[2] == pytest.approx(121.0)
    assert chained.iloc[-1] == pytest.approx(121.0 * 1.1025)


def test_benchmarks_run():
    """Verifica que los benchmarks Buy & Hold y Cruce de SMAs produzcan resultados validos."""
    n = 60
    index = pd.date_range("2024-01-01", periods=n, freq="D")
    close = np.linspace(100.0, 150.0, n)
    df = pd.DataFrame({
        "Open": close, "High": close * 1.01, "Low": close * 0.99, "Close": close, "Volume": 100.0
    }, index=index)

    m_bh, eq_bh, tr_bh = buy_and_hold(df, initial_capital=100000.0)
    assert len(eq_bh) == n
    assert m_bh.total_return > 0

    history = pd.Series(close, index=index)
    m_sma, eq_sma, tr_sma = sma_crossover(df, history, fast=5, slow=20, initial_capital=100000.0)
    assert len(eq_sma) == n


def test_hold_state_prevents_premature_neutral_exit(monkeypatch):
    """En zona neutral [-0.2, 0.2] o baja confianza, la posicion LONG se mantiene abierta (HOLD)."""
    n = 30
    opens = np.full(n, 100.0)
    df = make_prices(opens)

    out = np.zeros((n, 3))
    out[:, 2] = 1.0
    out[5] = [1.0, 1.0, 1.0]      # Señal BUY (abre en apertura 6)
    out[6] = [0.15, 0.25, 1.0]    # Neutral + baja confianza -> HOLD
    out[7] = [0.10, 0.80, 1.0]    # Neutral con alta confianza -> HOLD
    out[8] = [0.80, 0.20, 1.0]    # Alcista con baja confianza -> HOLD
    out[9] = [-0.80, 0.90, 1.0]   # Bajista con alta confianza -> SELL (cierra en apertura 10)

    patch_network(monkeypatch, out)

    bt = Backtester(initial_capital=100000.0, allow_short=False, min_trades=1)
    _, _, _, trades = bt.evaluate_genome(make_genome(), df, ["ind0", "ind1"])

    assert len(trades) == 1
    trade = trades[0]
    assert trade.entry_time == df.index[6]
    # No se vendió prematuramente en las barras 7, 8 o 9; se mantuvo hasta la barra 10
    assert trade.exit_time == df.index[10]
    assert trade.exit_reason == "signal"


def test_trailing_stop_starts_at_stop_loss_not_above():
    """trailing_stop_price inicia protegiendo igual que stop_loss_price para no anular el gen SL."""
    entry = 100.0
    pos = Position(
        position_type=PositionType.LONG,
        entry_price=entry,
        entry_time="2024-01-01",
        capital=10000.0,
        stop_loss_pct=0.05,       # SL al 5%
        trailing_stop_pct=0.01,   # TS al 1% (menor que SL)
        commission=0.0,
        slippage=0.0,
    )
    # Al inicio, trailing_stop_price debe coincidir con stop_loss_price (95.0), no 99.0
    assert pos.stop_loss_price == pytest.approx(95.0)
    assert pos.trailing_stop_price == pytest.approx(95.0)

    # Si el precio cae 2% (a 98.0), NO debe gatillar trailing stop
    exit_reason = pos.update_bar(high=100.0, low=98.0, close=98.0)
    assert exit_reason is None

    # Si sube fuertemente a 110.0, el trailing sube a 110 * 0.99 = 108.9
    exit_reason = pos.update_bar(high=110.0, low=100.0, close=109.0)
    assert exit_reason is None
    assert pos.trailing_stop_price == pytest.approx(108.9)


def test_sortino_ratio_target_downside_deviation():
    """Sortino ratio usa Target Downside Deviation respecto a 0 sobre todas las barras N."""
    initial = 100000.0
    eq = [initial]
    for _ in range(7):
        eq.append(eq[-1])
    for _ in range(3):
        eq.append(eq[-1] * 0.95)
    equity_series = pd.Series(eq)

    metrics = compute_metrics(equity_series, [], initial_capital=initial, timeframe="1d")
    assert np.isfinite(metrics.sortino_ratio)
    assert metrics.sortino_ratio < 0


def test_max_drawdown_circuit_breaker_exit_reason_and_unrealized_slippage(monkeypatch):
    """El cortacircuito asigna etiqueta max_drawdown y current_unrealized_pnl descuenta slippage."""
    # 1. Slippage en PnL flotante
    pos = Position(
        position_type=PositionType.LONG,
        entry_price=100.0,
        entry_time="2024-01-01",
        capital=10000.0,
        commission=0.005,
        slippage=0.002,
    )
    pnl_unrealized, _ = pos.current_unrealized_pnl(100.0)
    trade_closed = pos.close(100.0, "2024-01-02", "signal")
    assert pnl_unrealized == pytest.approx(trade_closed.pnl)

    # 2. Etiqueta max_drawdown cuando se activa el cortacircuito
    n = 40
    opens = np.empty(n)
    closes = np.empty(n)
    price = 100.0
    for i in range(n):
        opens[i] = price
        price *= 0.95  # Caída constante
        closes[i] = price
    df = make_prices(opens, closes)
    patch_network(monkeypatch, signal_outputs(n, all_long=True))

    genome = make_genome(max_drawdown=0.08, stop_loss=0.5, trailing_stop=0.5)
    _, _, _, trades = Backtester(initial_capital=100000.0, min_trades=1).evaluate_genome(
        genome, df, ["ind0", "ind1"]
    )
    assert len(trades) == 1
    assert trades[0].exit_reason == "max_drawdown"
