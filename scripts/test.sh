#!/usr/bin/env bash
# Script para executar a suite de testes do Radio Escola
set -euo pipefail

cd "$(cd "${0%/*}" && pwd)/.."

echo "================================================================"
echo "📻 RADIO ESCOLA - EXECUTANDO SUITE DE TESTES"
echo "================================================================"
echo ""

# Choose Bun as the test runner. If Bun is not in PATH, use the known installation path.
if command -v bun > /dev/null 2>&1; then
  RUNNER="bun"
elif [ -f "C:/Users/pc/AppData/Local/Microsoft/WinGet/Packages/Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe/bun-windows-x64/bun.exe" ]; then
  RUNNER="C:/Users/pc/AppData/Local/Microsoft/WinGet/Packages/Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe/bun-windows-x64/bun.exe"
else
  echo "Erro: Bun não encontrado no PATH nem no caminho padrão." >&2
  exit 1
fi

# Determine test mode based on arguments. Accept 'headed'/'--headed' and other modes.
MODE="all"
for arg in "$@"; do
  case "$arg" in
    headed|--headed) MODE="headed" ;;
    integration|int) MODE="integration" ;;
    unit) MODE="unit" ;;
    all-project) MODE="all-project" ;;
    *) ;;
  esac
done
  case "$MODE" in
    "integration"|"int")
      echo "▶ Executando todos os testes de Integração..."
      $RUNNER run test __tests__/integration/
      ;;
    "unit")
      echo "▶ Executando todos os testes Unitários..."
      $RUNNER run test __tests__/unit/
      ;;
    "all-project")
      echo "▶ Executando todos os testes do projeto..."
      $RUNNER run test
      ;;
    "headed")
      echo "▶ Executando testes HEADED das Calculadoras..."
      $RUNNER run scripts/run_e2e.ts --headed
      ;;
    *)
      echo "▶ Executando testes HEADLESS das Calculadoras..."
      $RUNNER run scripts/run_e2e.ts
      ;;
  esac


echo ""
echo "================================================================"
echo "✓ Execução de testes concluída com sucesso!"
echo "================================================================"
