@echo off
title Rádio Escola - Testes E2E em Browser Real
cls
echo ================================================================
echo  RADIO ESCOLA - ABRINDO O BROWSER PARA EXECUTAR OS TESTES E2E
echo ================================================================
echo.
cd /d "C:\Users\pc\radioescola"
"C:\Users\pc\AppData\Local\Microsoft\WinGet\Packages\Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64\bun.exe" run test:e2e
echo.
echo ================================================================
echo  Testes concluidos!
echo ================================================================
pause
