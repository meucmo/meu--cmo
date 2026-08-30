# 📤 SETUP — Enviar o Meu CMO para o GitHub

Guia passo a passo para pegar o código deste projeto, versioná-lo e enviá-lo para o GitHub (pré-requisito para deploy no Railway ou qualquer hospedagem externa).

---

## ✅ Pré-requisitos

1. **Git** instalado (`git --version`)
2. Conta no **[GitHub](https://github.com)**
3. O código deste projeto baixado na sua máquina (export do sandbox)

> O repositório local **já está inicializado** com git e tem um commit inicial na branch `main`. Se você recebeu apenas os arquivos (sem `.git`), rode `git init && git branch -M main` antes do Passo 2.

---

## PASSO 1 — Baixar / exportar o código

Baixe o projeto (zip/tar) do sandbox e descompacte na sua máquina:

```bash
# exemplo
unzip meu-cmo.zip -d meu-cmo
cd meu-cmo
```

> O `.gitignore` já está configurado para **não** subir `node_modules/`, `apps/pocketbase/pb_data/`, `.env`, builds e arquivos temporários. Confira que esses caminhos não aparecem no `git status`.

---

## PASSO 2 — Criar o repositório no GitHub

1. Acesse **https://github.com/new**
2. **Repository name:** `meu-cmo`
3. Escolha **Private** (recomendado — tem segredos no `.env.example`) ou **Public**
4. **NÃO** marque "Add a README", ".gitignore" ou "license" (já existem aqui)
5. Clique em **Create repository**

O GitHub vai mostrar uma URL parecida com:
```
https://github.com/SEU_USUARIO/meu-cmo.git
```

---

## PASSO 3 — Configurar o autor do git (se ainda não configurou)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

---

## PASSO 4 — Conferir o que será enviado

```bash
git status          # deve mostrar "working tree clean" ou só arquivos de código
git log --oneline   # mostra o commit inicial
git ls-files | wc -l   # ~300 arquivos (código), NENHUM node_modules/pb_data
```

Se aparecer `node_modules/`, `pb_data/` ou `.env` como "untracked/tracked", o `.gitignore` não foi aplicado — confira que o arquivo `.gitignore` está na raiz e rode:

```bash
git rm -r --cached node_modules apps/web/node_modules apps/api/node_modules apps/pocketbase/pb_data 2>/dev/null
git add .gitignore
git commit -m "chore: aplicar .gitignore"
```

---

## PASSO 5 — Conectar ao GitHub e enviar

```bash
git remote add origin https://github.com/SEU_USUARIO/meu-cmo.git
git branch -M main
git push -u origin main
```

Na primeira vez o Git vai pedir seu usuário/senha ou token do GitHub. Use um **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens) no lugar da senha.

> **Repositório privado/organização?** O Railway precisa de autorização do GitHub App — faça isso ao conectar o repo no Railway (Passo do `RAILWAY_DEPLOY.md`).

---

## PASSO 6 — Conferir no GitHub

Abra `https://github.com/SEU_USUARIO/meu-cmo`:
- ✅ Vê os arquivos `README.md`, `SETUP.md`, `railway.json`, `package.json`, `apps/`
- ✅ **Não** vê `node_modules/`, `apps/pocketbase/pb_data/`, `.env`, `app.tar.gz`
- ✅ Branch `main` com o commit

---

## PASSO 7 — Próximos passos

Agora que o código está no GitHub:

- **Deploy no Railway:** abra `RAILWAY_DEPLOY.md` e siga a partir do PASSO 2 (criar serviço a partir do repo).
- **Desenvolvimento local:** `npm install && npm run dev` (veja o `README.md`).
- **Deploy na Hostinger AI Builder:** publique pelo painel da plataforma.

---

## 🧯 Problemas comuns

| Sintoma | Solução |
|--------|---------|
| `fatal: remote origin already exists` | `git remote set-url origin https://github.com/SEU_USUARIO/meu-cmo.git` |
| `Permission denied (publickey)` | use HTTPS com token, ou configure chave SSH |
| `rejected — non-fast-forward` | `git pull origin main --rebase` e depois `git push` |
| Repo muito pesado (>100MB) | confira que `node_modules/` e `pb_data/` não foram commitados (Passo 4) |
| `apps/pocketbase/pocketbase: not found` no deploy | o binário Linux x86_64 precisa subir no repo — **não** adicione `apps/pocketbase/pocketbase` ao `.gitignore` |

---

Pronto! O Meu CMO está no GitHub e pronto para deploy. 🎉
