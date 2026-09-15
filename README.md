# Sala Aberta — Blog Front-end (Tech Challenge Fase 3)

SPA em React que consome a API REST de posts e autenticação da [Fase 2](https://github.com/MatheusMatiasUniver/Tech-Challeng-Fase-2). Qualquer visitante lê e busca posts publicados; um professor autenticado cria, edita e exclui **apenas os próprios** posts.

## Stack

React 18 + TypeScript + Vite, Axios (cliente HTTP), React Router, Styled Components. Testes: Vitest + Testing Library (unitário) e Playwright (E2E).

## Pré-requisitos

- Node.js 20+
- Docker (para rodar a API da Fase 2 localmente e/ou para o build de produção deste front-end)

## Rodando localmente

### 1. Subir a API (Fase 2)

Este repositório **não** inclui o back-end — ele é um projeto isolado. Clone e suba com Docker:

```bash
git clone https://github.com/MatheusMatiasUniver/Tech-Challeng-Fase-2.git
cd Tech-Challeng-Fase-2
cp .env.example .env   # ajuste DATABASE_USER/PASSWORD e JWT_SECRET se quiser
docker compose up -d postgres api
```

A API sobe em `http://localhost:3001` (roda migrations e o seed automaticamente). Confirme com `curl http://localhost:3001/health` (`{"status":"ativo"}`).

Usuários de teste (seed):

| E-mail | Senha |
|---|---|
| `professor@exemplo.com` | `123456` |
| `professor1@exemplo.com` | `123456` |
| `professor2@exemplo.com` | `123456` |

### 2. Rodar este front-end

```bash
npm install
cp .env.example .env   # API_PROXY_TARGET=http://localhost:3001
npm run dev
```

Abra `http://localhost:5173`. O Vite faz proxy de `/api/*` para `API_PROXY_TARGET`, cortando o prefixo `/api` — o navegador só enxerga uma origem (evita CORS; a API da Fase 2 não tem CORS habilitado, de propósito, para não alterar aquele repositório).

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento com proxy para a API |
| `npm run build` | `tsc -b` + build de produção em `dist/` |
| `npm run preview` | serve o build de produção localmente |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc -b` sem gerar arquivos |
| `npm test` | testes unitários (Vitest) |
| `npm run test:e2e` | testes E2E (Playwright) |

## Testes

**Unitários** (Vitest + Testing Library): `npm test`. Mockam a API — não precisam dela rodando.

**E2E** (Playwright): `npm run test:e2e` sobe o Vite sozinho (`webServer` no `playwright.config.ts`).

- `e2e/app.spec.ts` e `e2e/regressions.spec.ts` mockam a API via `page.route` — cobrem o carregamento inicial e 4 regressões de timing (redirecionamento pós-login, expiração de sessão, corrida de busca, URL longa no celular).
- `e2e/crud.spec.ts` roda contra a **API real** (criar/editar/excluir post, autoria entre professores) — exige a API da Fase 2 rodando (passo 1 acima) antes de `npm run test:e2e`.

## Docker (build de produção)

Build multi-stage: compila a SPA com Node e serve com nginx, que também faz o proxy de `/api/*` para a API — mesma ideia do Vite em desenvolvimento, agora em produção.

```bash
docker build -t tech-challenge-fase-3 .
docker run -d -p 8080:80 \
  --add-host=host.docker.internal:host-gateway \
  -e API_PROXY_TARGET=http://host.docker.internal:3001 \
  tech-challenge-fase-3
```

Abra `http://localhost:8080`. `API_PROXY_TARGET` é resolvido no `nginx.conf.template` via `envsubst` (mecanismo nativo da imagem oficial do nginx) quando o container inicia.

Se a API também rodar em Docker na mesma máquina, dá para conectar o container deste front-end diretamente à rede do `docker compose` da API (`docker network ls`) em vez de usar `host.docker.internal`, apontando `API_PROXY_TARGET` para o nome do serviço (ex.: `http://api:3001`).

## CI

`.github/workflows/ci.yml` roda em todo push/PR para `main`: lint, typecheck, testes unitários, E2E mockado (`app.spec.ts` + `regressions.spec.ts`), build e `docker build`. `crud.spec.ts` fica fora do CI de propósito — precisa da API real, que não roda no runner do GitHub Actions; ele é validado localmente/manualmente.

## Decisões de arquitetura

- **Sem CORS, com proxy de mesma origem:** a API da Fase 2 não tem CORS habilitado e não foi alterada. O navegador só fala com uma origem; quem repassa para a API é o Vite (dev) ou o nginx (Docker).
- **Autoria vem do JWT, não do formulário:** o formulário de post envia só `title`/`content`; o back-end decide o autor pelo token. A interface oculta ações (editar/excluir) que o servidor recusaria, mas o servidor continua sendo a autoridade.
- **"Publicando como" = e-mail do login:** a API não expõe nome nem `/auth/me`, só um id no token. A interface guarda o e-mail digitado no login (`sessionStorage`) e mostra a parte antes do "@" — não é um nome inventado.
- **Sessão em `sessionStorage`, com expiração ativa:** a sessão termina sozinha quando o token expira, mesmo com a aba aberta parada.
