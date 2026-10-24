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
    # Con 'val', gana A (0.5 < ? espera, si A tiene val=1.5 y train=0.2 vs B train=1.0 val=0.9):
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
