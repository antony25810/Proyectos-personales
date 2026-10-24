# 🧬 Neuroevolución NEAT para Trading Algorítmico Multiobjetivo

Sistema de **Neuroevolución de Topologías Aumentadas (NEAT)** aplicado al descubrimiento y optimización automática de estrategias de trading cuantitativo en criptomonedas (**BTC-MXN / ETH-MXN**).

A diferencia de los enfoques convencionales de Deep Learning basados en backpropagation, este sistema evoluciona conjuntamente la **topología de la red**, los **pesos sinápticos**, la **selección de indicadores técnicos** y los **parámetros continuos de gestión de riesgo**, validando cada individuo mediante **Walk-Forward Analysis** causal y fuera de muestra.

---

## 🎯 Aspectos Clave del Sistema

### 1. ¿Por qué Neuroevolución en Trading?
- **Función objetivo no diferenciable:** Métricas financieras como Sharpe, Sortino, Calmar, drawdown máximo y comisiones discretas no admiten gradientes directos.
- **Topologías mínimas:** La población inicia sin capas ocultas (complejidad estructural mínima). Las conexiones y neuronas adicionales solo sobreviven si aportan una ventaja comprobada en el fitness.
- **Evolución simultánea de Estrategia + Riesgo:** El genoma no es solo un predictor; define las reglas completas de ejecución:
  - **Red neuronal:** Arquitectura, pesos, biases y funciones de activación.
  - **Máscara de indicadores:** Selección adaptativa del subconjunto óptimo de variables técnicas (RSI, MACD, ATR, ADX, Bollinger, etc.).
  - **Parámetros de riesgo:** Stop Loss, Take Profit, Trailing Stop, Drawdown Máximo y Tamaño de Posición.

### 2. Mitigación Rigurosa del Sobreajuste
- **Walk-Forward Analysis (WFA):** Ventanas deslizantes multianuales (3 años de Train, 1 año de Validación, 1 año de Test Out-of-Sample) con encadenamiento continuo de capital.
- **Función Fitness Multiobjetivo Acotada:**
  $$\text{base} = 0.35 \tanh\left(\frac{\text{Sortino}}{2}\right) + 0.25 \tanh\left(\frac{\text{Calmar}}{2}\right) + 0.25 \tanh\left(\frac{\text{Retorno}}{0.25}\right) + 0.15 \tanh(\ln(\max(\text{PF}, 0.1)))$$
  Acompañada de penalizaciones cuadráticas por suboperación (overfitting a pocos trades), exceso de drawdown, rotación excesiva y complejidad de la red.
- **Criterio de Selección Conservador:** $\min(\text{Train Fitness}, \text{Val Fitness})$ para castigar individuos con memorización excesiva.
- **Early Stopping Suavizado:** Monitoreo de la mediana móvil de validación ($k=3$) para amortiguar ruido estocástico intergeneracional.
- **Normalización Causal con Tanh:** Z-score rolling causal con compresión $\tanh(z / 2.0)$ para preservar colas pesadas sin saturación artificial y con descarte de periodos de calentamiento.

### 3. Causalidad y Restricciones de Mercado Spot (Bitso)
- **Causalidad Temporal Estricta:** La señal calculada al cierre de la barra $t$ se ejecuta en la apertura de la barra $t+1$.
- **Política Intrabar Conservadora:** En barras donde coinciden niveles de stop y take profit, se asume la ejecución desfavorable en primer lugar para evitar sesgos optimistas.
- **Modo Spot (`allow_short: false`):** Señales bajistas cierran posiciones largas y retienen liquidez en efectivo (`CASH`), adaptado a exchanges spot reales sin ventas en corto.
- **Benchmarks Basales Nativos:** Comparación directa contra **Buy & Hold** y **Cruce de Medias Móviles SMA (50/200)** evaluados bajo el mismo modelo de costos y deslizamiento.

---

## 🏗️ Arquitectura del Genoma y Flujo

```
                   DATOS HISTÓRICOS (BTC-USD x USD/MXN)
                                    │
                                    ▼
                     Normalización Z-Score + Tanh
                                    │
                                    ▼
                   Walk-Forward (Train / Val / Test)
                                    │
                                    ▼
       ┌──────────────── Población NEAT ────────────────┐
       │ - Nodos & Conexiones (Innovación Histórica)   │
       │ - Máscara de Indicadores Activos               │
       │ - Parámetros de Riesgo (Mutación Gaussiana)    │
       └────────────────────────┬───────────────────────┘
                                │
                                ▼
                   Backtesting Barra a Barra
                                │
                                ▼
                     Cálculo de Fitness Acotado
                                │
       ┌────────────────────────┴───────────────────────┐
       ▼                                                ▼
 Especiación & Cruzamiento                   Mutación y Perturbación
       │                                                │
       └────────────────────────┬───────────────────────┘
                                │
                                ▼
                    Siguiente Generación
                                │
                                ▼
            Mejor Genoma en Val ──► Test Out-of-Sample
                                │
                                ▼
                Reportes, Curvas de Equidad & Métricas
```

---

## 📁 Estructura del Proyecto

```text
Neuroevolucion_NEAT/
├── config/
│   ├── neat_config.yaml       # Parámetros genéticos (población, mutación, especiación)
│   └── trading_config.yaml    # Configuración de backtest, walk-forward, comisiones y riesgo
├── src/
│   ├── data/                  # Descarga, sincronización de calendarios, indicadores y normalizador
│   ├── evolution/             # Motor Walk-Forward, evaluación paralela y early stopping
│   ├── neat/                  # Genoma, red neuronal, especiación, mutación y reproducción
│   ├── trading/               # Backtester causal, posición, cálculo de métricas y benchmarks
│   ├── visualization/         # Gráficas de equidad OOS, drawdown y evolución de fitness
│   └── main.py                # Punto de entrada CLI con soporte multi-semilla
├── tests/
│   ├── test_refactor_regressions.py  # 10 pruebas de regresión e invariantes de NEAT
│   └── test_new_features.py          # 7 pruebas de normalización tanh, mutación, spot y benchmarks
├── propuesta.txt              # Documento original con la propuesta metodológica
├── pytest.ini                 # Configuración de pruebas
└── requirements.txt           # Dependencias del proyecto
```

---

## 🚀 Instalación y Uso

### 1. Requisitos Previos
- Python 3.10 o superior (validado en Python 3.13)

### 2. Configuración del Entorno
```bash
# Clonar el repositorio y entrar a la carpeta
cd Neuroevolucion_NEAT

# Crear y activar entorno virtual
python -m venv venv
# En Windows:
.\venv\Scripts\activate
# En Linux/macOS:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Ejecutar Pruebas Automatizadas
El proyecto cuenta con una suite completa de 17 pruebas unitarias y de regresión:
```bash
pytest -v
```

### 4. Ejecución del Sistema
```bash
# Prueba rápida de verificación (ej. 5 generaciones, población 20)
python main.py --generations 5 --pop_size 20 --seeds 42

# Corrida completa con múltiples semillas y paralelismo
python main.py --seeds 42 100 2024 --workers 4
```

Los resultados, curvas de equidad encadenadas y resúmenes estadísticos se exportan automáticamente en la carpeta `runs/`.

---

## 📊 Tecnologías Utilizadas

- **Lenguaje:** Python 3.13
- **Cálculo Numérico & Datos:** NumPy, Pandas, PyArrow
- **Optimización Evolutiva:** NEAT (NeuroEvolution of Augmenting Topologies) implementado a medida
- **Finanzas Cuantitativas:** Backtesting causal de eventos con comisiones y deslizamiento
- **Visualización:** Matplotlib, Seaborn
- **Configuración & Pruebas:** PyYAML, Pytest
