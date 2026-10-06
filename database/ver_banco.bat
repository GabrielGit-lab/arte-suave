@echo off
chcp 65001 > nul
title Arte Suave - Gerenciador do Banco de Dados
cls
echo ========================================================
echo  Abrindo Gerenciador do Banco de Dados SQLite...
echo ========================================================
node "%~dp0gerenciador.js"
echo.
echo Pressione qualquer tecla para sair...
pause > nul
