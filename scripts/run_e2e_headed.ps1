# PowerShell wrapper to run the headed Playwright E2E tests
# Usage: .\scripts\run_e2e_headed.ps1

$bunPath = "C:/Users/pc/AppData/Local/Microsoft/WinGet/Packages/Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe/bun-windows-x64/bun.exe"

if (-not (Test-Path $bunPath)) {
    Write-Error "Bun executable not found at $bunPath"
    exit 1
}

# Change to repository root (parent of scripts folder)
Set-Location "$PSScriptRoot\.."

# Execute the headed test script
& $bunPath run scripts/run_e2e_headed.ts
