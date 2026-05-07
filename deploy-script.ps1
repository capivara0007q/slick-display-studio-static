# Script para Deploy via Git - Copie e Cole!

# ============================================
# PASSO 1: PREPARAR REPOSITÓRIO LOCAL
# ============================================

Write-Host "=== PASSO 1: Preparando Repositório Local ===" -ForegroundColor Green

cd C:\Projetos\slick-display-studio-static

# Inicializar Git
git init

# Configurar Git (primeira vez)
# MUDE ISSO PARA SEU NOME E EMAIL!
git config user.name "Seu Nome"
git config user.email "seu@email.com"

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Deploy versão estática - Slick Display Studio"

Write-Host "✅ Repositório local preparado!" -ForegroundColor Green
Write-Host ""
Write-Host "=== PASSO 2: Criar Repositório no GitHub ===" -ForegroundColor Yellow
Write-Host "1. Acesse: https://github.com/new" -ForegroundColor Cyan
Write-Host "2. Nome: slick-display-studio-static" -ForegroundColor Cyan
Write-Host "3. Visibility: Public" -ForegroundColor Cyan
Write-Host "4. Create repository" -ForegroundColor Cyan
Write-Host ""
Write-Host "COPIE a URL do repositório (https://github.com/...)" -ForegroundColor Yellow
$repoUrl = Read-Host "Cole a URL aqui"

Write-Host ""
Write-Host "=== PASSO 3: Subindo para GitHub ===" -ForegroundColor Green

# Adicionar remote
git remote add origin $repoUrl

# Fazer branch main
git branch -M main

# Push
git push -u origin main

Write-Host "✅ Código enviado para GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "=== PASSO 4: Conectar Netlify ===" -ForegroundColor Yellow
Write-Host "1. Acesse: https://netlify.com" -ForegroundColor Cyan
Write-Host "2. Click: Add new site → Import existing project" -ForegroundColor Cyan
Write-Host "3. Selecione: GitHub" -ForegroundColor Cyan
Write-Host "4. Autorize e selecione seu repositório" -ForegroundColor Cyan
Write-Host "5. Build command: (deixe vazio)" -ForegroundColor Cyan
Write-Host "6. Publish directory: dist/client" -ForegroundColor Cyan
Write-Host "7. Deploy site!" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ PRONTO! Seu site está publicado!" -ForegroundColor Green
Write-Host "A URL será gerada automaticamente no Netlify" -ForegroundColor Green
