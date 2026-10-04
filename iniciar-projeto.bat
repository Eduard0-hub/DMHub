@echo off
setlocal
title BarberHub - Inicializador

set "ROOT=%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js nao foi encontrado. Instale-o e tente novamente.
    goto :error
)

where npm >nul 2>&1
if errorlevel 1 (
    echo npm nao foi encontrado. Reinstale o Node.js e tente novamente.
    goto :error
)

where java >nul 2>&1
if errorlevel 1 (
    echo Java 17 nao foi encontrado. Instale-o e tente novamente.
    goto :error
)

where mvn >nul 2>&1
if errorlevel 1 (
    echo Maven nao foi encontrado. Instale o Maven e adicione-o ao PATH.
    goto :error
)

if not exist "%ROOT%backend\pom.xml" (
    echo Backend nao encontrado em "%ROOT%backend".
    goto :error
)

if not exist "%ROOT%src\package.json" (
    echo Frontend nao encontrado em "%ROOT%src".
    goto :error
)

echo Iniciando o backend em http://localhost:8081...
start "BarberHub - Backend" cmd /k "cd /d ""%ROOT%backend"" && mvn spring-boot:run"

echo Iniciando o frontend em http://localhost:5173...
start "BarberHub - Frontend" cmd /k "cd /d ""%ROOT%src"" && npm ci && npm run dev"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$deadline = (Get-Date).AddSeconds(90); while ((Get-Date) -lt $deadline) { if (Test-NetConnection -ComputerName 'localhost' -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue) { Start-Process 'http://localhost:5173'; exit 0 }; Start-Sleep -Milliseconds 500 }; Write-Host 'O frontend nao iniciou em 90 segundos.'"

echo.
echo Os servicos foram iniciados em janelas separadas.
echo Feche as duas janelas para encerrar o projeto.
pause
exit /b 0

:error
echo.
pause
exit /b 1
