# 🚀 Deploy Completo via Git (Gratuito)

## ✅ Tudo Funcionará Automaticamente

Ao usar **Git + GitHub + Netlify**, você NÃO precisa se preocupar com `_redirects`. O Netlify fará tudo automaticamente!

---

## 📋 Passo 1: Preparar o Repositório Local

Abra **PowerShell** e execute:

```powershell
# Navegue até a pasta
cd c:\Projetos\slick-display-studio-static

# Inicialize Git
git init

# Configure Git (primeira vez apenas)
git config user.name "Seu Nome Aqui"
git config user.email "seu@email.com"

# Adicione todos os arquivos
git add .

# Faça commit
git commit -m "Deploy versão estática - Slick Display Studio"
```

---

## 🌐 Passo 2: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **"+"** (canto superior direito)
3. Selecione **"New repository"**
4. Preencha:
   - **Repository name**: `slick-display-studio-static`
   - **Description**: Versão estática para deploy
   - **Visibility**: `Public` (necessário para Netlify gratuito)
   - **Create repository**

5. **COPIE a URL** que aparecerá (tipo: `https://github.com/SEU-USUARIO/slick-display-studio-static.git`)

---

## 📤 Passo 3: Subir Código para GitHub

No **PowerShell**, execute os comandos que aparecerem na página do GitHub:

```powershell
# Volte para a pasta (se saiu)
cd c:\Projetos\slick-display-studio-static

# Adicione o repositório remoto (substitua pela sua URL)
git remote add origin https://github.com/SEU-USUARIO/slick-display-studio-static.git

# Renomeie branch para main (se necessário)
git branch -M main

# Suba o código
git push -u origin main
```

✅ **Pronto! Código está no GitHub**

---

## 🎪 Passo 4: Conectar Netlify com GitHub

1. Acesse [netlify.com](https://netlify.com)
2. Faça login (crie conta se não tiver)
3. Clique em **"Add new site"**
4. Selecione **"Import an existing project"**
5. Escolha **"GitHub"** como provedor
6. Autorize Netlify a acessar GitHub
7. **Selecione seu repositório**: `slick-display-studio-static`
8. Configure:
   - **Build command**: (deixe vazio - sem compilação)
   - **Publish directory**: `dist/client`
   - **Environment variables**: (deixe vazio)
9. Clique **"Deploy site"**

⏳ Aguarde 1-2 minutos...

✅ **URL gerada automaticamente!** (tipo: `https://randomname.netlify.app`)

---

## ✨ O Que Acontece Automaticamente

✅ Netlify detecta GitHub  
✅ Netlify lê `netlify.toml` (redirecionamentos)  
✅ Rotas funcionam perfeitamente  
✅ Deploy automático a cada push no GitHub  
✅ Certificado SSL grátis (HTTPS)  

---

## 🔄 Próximas Mudanças (Super Fácil)

Toda vez que você mudar o código:

```powershell
# Na pasta do projeto
git add .
git commit -m "Descrição da mudança"
git push
```

✅ **Netlify faz deploy automático em 30 segundos!**

---

## 📝 Resumo Financeiro

| Serviço | Custo |
|---------|-------|
| GitHub | **GRÁTIS** ✅ |
| Netlify (via Git) | **GRÁTIS** ✅ |
| Domínio personalizado | ~$12/ano (opcional) |
| **Total** | **GRÁTIS** ✅ |

---

## ❓ FAQ

### P: Preciso de crédito no Netlify?
**R**: Não! Quando você conecta Git, Netlify oferece build/deploy gratuito.

### P: E se eu mudar o código?
**R**: Push para GitHub e Netlify faz deploy automaticamente em 30 segundos.

### P: Posso usar domínio próprio?
**R**: Sim! Mas custa ~$12/ano. Você pode usar `netlify.app` grátis.

### P: As rotas funcionarão?
**R**: Sim! Netlify lê `netlify.toml` automaticamente.

### P: Preciso de terminal para cada mudança?
**R**: Você pode usar **GitHub Desktop** (GUI) para não mexer com terminal.

---

## 🎯 Pronto?

Siga os 4 passos acima e você terá um site **100% gratuito** e **automático**!

Se travar em algum passo, me avise qual número! 👍
