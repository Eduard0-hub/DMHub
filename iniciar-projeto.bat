@echo off
setlocal
title BarberHub - Inicializador

net start MySQL80

set "ROOT=%~dp0"
set "JDK_HOME=C:\Program Files\Java\jdk-17"

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js nao foi encontrado. Instale-o e tente novamente.
    pause
    exit /b 1
)

if not exist "%ROOT%backend\mvnw.cmd" (
    echo Maven Wrapper nao encontrado em "%ROOT%backend".
    pause
    exit /b 1
)

if not exist "%JDK_HOME%\bin\java.exe" (
    echo JDK 17 nao encontrado em "%JDK_HOME%".
    echo Instale o JDK 17 ou ajuste a variavel JDK_HOME neste arquivo.
    pause
    exit /b 1
)

set "JAVA_HOME=%JDK_HOME%"

echo Iniciando o backend em http://localhost:8081...
start "BarberHub - Backend" cmd /k "cd /d ""%ROOT%backend"" && call mvnw.cmd spring-boot:run"

echo Iniciando o frontend em http://localhost:5173...
start "BarberHub - Frontend" cmd /k "cd /d ""%ROOT%src"" && call npm install && call npm run dev"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$deadline = (Get-Date).AddSeconds(90); while ((Get-Date) -lt $deadline) { if (Test-NetConnection -ComputerName 'localhost' -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue) { Start-Process 'http://localhost:5173'; exit 0 }; Start-Sleep -Milliseconds 500 }; Write-Host 'O frontend nao iniciou em 90 segundos.'"

echo.
echo Os servicos foram iniciados em janelas separadas.
echo Feche as duas janelas para encerrar o projeto.
pause