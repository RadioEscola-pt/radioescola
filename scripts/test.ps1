# PowerShell Test Runner for Radio Escola
param (
    [string]$Mode = "all"
)

$ErrorActionPreference = "Stop"
Set-Location "$PSScriptRoot\.."

$bunPath = "C:\Users\pc\AppData\Local\Microsoft\WinGet\Packages\Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64\bun.exe"

if (-not (Test-Path $bunPath)) {
    $bunCmd = Get-Command bun -ErrorAction SilentlyContinue
    if ($bunCmd) {
        $bunPath = $bunCmd.Source
    } else {
        Write-Error "Bun executable not found."
        exit 1
    }
}

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "RADIO ESCOLA - EXECUTANDO TESTES ($Mode)" -ForegroundColor Cyan
Write-Host "================================================================`n" -ForegroundColor Cyan

switch ($Mode.ToLower()) {
    { $_ -in "calculators", "calc" } {
        Write-Host "Executando testes das Calculadoras..." -ForegroundColor Yellow
        & $bunPath run test __tests__/integration/test-calculators.test.tsx __tests__/unit/test-calculator-* __tests__/unit/test-electrical.test.ts
    }
    { $_ -in "integration", "int" } {
        Write-Host "Executando testes de Integracao..." -ForegroundColor Yellow
        & $bunPath run test __tests__/integration/
    }
    "unit" {
        Write-Host "Executando testes Unitarios..." -ForegroundColor Yellow
        & $bunPath run test __tests__/unit/
    }
    "e2e" {
        Write-Host "Executando testes E2E em navegador real..." -ForegroundColor Yellow
        & $bunPath run test:e2e
    }
    default {
        Write-Host "Executando todos os 116 testes..." -ForegroundColor Yellow
        & $bunPath run test
    }
}

Write-Host "`n================================================================" -ForegroundColor Green
Write-Host "Execucao de testes concluida com sucesso!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
