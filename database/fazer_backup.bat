@echo off
chcp 65001 > nul
title Arte Suave - Backup do Banco de Dados
cls
echo ========================================================
echo  Exportando Backup Completo do Banco de Dados...
echo ========================================================
node "%~dp0exportar_backup.js"
echo.
echo Pressione qualquer tecla para sair...
pause > nul
