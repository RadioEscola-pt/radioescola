#!/usr/bin/env bash
# Script para executar a suite de testes do Radio Escola
set -euo pipefail

cd "$(dirname "$0")/.."

echo "================================================================"
echo "📻 RADIO ESCOLA - EXECUTANDO SUITE DE TESTES"
echo "================================================================"
echo ""

# Determinar comando do Bun / Node
if command -v bun >/dev/null 2>&1; then
  RUNNER="bun"
elif command -v npm >/dev/null 2>&1; then
  RUNNER="npm"
else
  echo "Erro: nem 'bun' nem 'npm' foram encontrados no PATH." >&2
  exit 1
fi

MODE="${1:-all}"

case "$MODE" in
  "integration"|"int")
    echo "▶ Executando todos os testes de Integracao..."
    $RUNNER run test __tests__/integration/
    ;;
  "unit")
    echo "▶ Executando todos os testes Unitarios..."
    $RUNNER run test __tests__/unit/
    ;;
  "all-project")
    echo "▶ Executando todos os testes do projeto..."
    $RUNNER run test
    ;;
  "calculators"|"calc"|"all"|*)
    echo "▶ Executando os 116 testes das Calculadoras (Integracao e Unitarios)..."
    $RUNNER run test __tests__/integration/test-calculators.test.tsx __tests__/unit/test-calculator-* __tests__/unit/test-electrical.test.ts
    ;;
esac

echo ""
echo "================================================================"
echo "✓ Execucao de testes concluida com sucesso!"
echo "================================================================"
