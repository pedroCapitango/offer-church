<div align="center">
  <h1>Offer Church - Tesouraria API</h1>
  <p>API de gestão de contribuições (dízimos, ofertas, etc.) para igrejas, construída com NestJS, Prisma e PostgreSQL.</p>
</div>

## Sumário

- Visão Geral
- Stack Tecnológica
- Requisitos
- Configuração Rápida (Desenvolvimento)
- Banco de Dados & Migrações
- Execução com Docker
- Autenticação (JWT)
- Endpoints Principais
- Upload de Comprovantes
- Dashboard / Métricas
- Variáveis de Ambiente
- Scripts NPM
- Testes
- Roadmap de Melhorias

## Visão Geral

Este repositório contém a API de tesouraria que gerencia usuários, movimentos financeiros e fornece métricas consolidadas para um painel (dashboard) do tesoureiro.

## Stack Tecnológica

- Node.js / TypeScript
- NestJS
- Prisma ORM (PostgreSQL)
- JWT (Autenticação)
- Multer (upload de arquivos)
- Swagger (documentação automática)
- Docker / Docker Compose

## Requisitos

- Node 20+
- Docker + Docker Compose (opcional mas recomendado)
- PostgreSQL (se não usar Docker Compose)

## Configuração Rápida (Desenvolvimento)

1. Clone o projeto:
	git clone <repo> && cd offer-church/tesouraria
2. Copie o arquivo de exemplo de variáveis de ambiente:
	cp .env.example .env
3. (Opcional) Suba o banco via Docker Compose na raiz ou dentro de `tesouraria` se existir compose:
	docker compose up -d
4. Instale dependências:
	npm install
5. Execute migrações (gera banco + aplica schema):
	npx prisma migrate dev
6. Gere o client Prisma (normalmente já incluso no passo acima, mas pode forçar):
	npx prisma generate
7. Inicie em modo desenvolvimento:
	npm run start:dev

Aplicação por padrão: http://localhost:3000

Swagger (OpenAPI): http://localhost:3000/api

## Banco de Dados & Migrações

Migração inicial cria tabelas `Usuario` e `Movimento` e enums. Comandos usuais:
- Criar nova migração: npx prisma migrate dev --name nome_da_migracao
- Ver estado: npx prisma migrate status
- Acessar Studio: npx prisma studio

## Execução com Docker

Build da imagem da aplicação (dentro de `tesouraria`):
  docker build -t offer-church-api .

Executar container apontando para um banco externo (ajuste DATABASE_URL):
  docker run --env-file .env -p 3000:3000 offer-church-api

Se quiser compor com Postgres, crie/ajuste um docker-compose.yml com serviços `api` e `db` e garanta a variável DATABASE_URL correta.

## Autenticação (JWT)

Fluxo:
1. Criar usuário (rota pública): POST /usuarios
2. Fazer login: POST /auth/login (recebe { email, senha }) → retorna { access_token }
3. Usar o token no header: Authorization: Bearer <token>

O token assina o `sub` (id do usuário) e `email`. Não há refresh token ainda.

## Endpoints Principais (Resumo)

- POST /auth/login → autenticação
- POST /usuarios → cria usuário (público)
- GET /usuarios (protegido) → lista usuários (sem senha)
- CRUD /movimentos (protegido) → gerencia movimentos; suporte a upload de comprovante
- GET /dashboard/resumo (protegido) → totais básicos
- GET /dashboard/serie/dia (protegido)
- GET /dashboard/serie/mes (protegido)

Use o Swagger para detalhes de payloads e schemas.

## Upload de Comprovantes

- Endpoint: POST /movimentos (multipart/form-data)
- Campo de arquivo: comprovante
- Campos textuais: descricao, valor, tipo (DIZIMO|OFERTA|OUTRO), data (YYYY-MM-DD), usuarioId
- Arquivos armazenados em `uploads/` (servidos estaticamente). Ajuste `UPLOAD_DIR` no .env se necessário.

## Dashboard / Métricas

Serviço atual fornece:
- Resumo: somas gerais e últimos movimentos (pode ser expandido)
- Séries por dia e por mês para gráficos

Melhorias futuras: breakdown por tipo, top contribuidores, média móvel, comparativos período atual vs anterior.

## Variáveis de Ambiente

Veja `.env.example`.
Principais:
- DATABASE_URL=postgresql://user:pass@host:5432/tesouraria?schema=public
- JWT_SECRET=chave forte
- PORT=3000
- UPLOAD_DIR=uploads
- LOG_LEVEL=log

## Scripts NPM

- start: node dist/main.js
- start:dev: Nest + watch (ts-node)
- build: tsc (gera dist)
- test / test:e2e / test:cov: Jest

## Testes

Para rodar e2e (necessita DB):
  npm run test:e2e

Adicione testes adicionais para:
- Autorização (acesso negado sem token)
- Upload de arquivo
- Dashboard (valida agregações)

## Roadmap de Melhorias

Curto Prazo:
- Validação (class-validator + ValidationPipe global)
- Guards de Role (ADMIN vs USER)
- Sanitização avançada de respostas e DTOs de saída
- Tratamento de erros padronizado (filtros de exceção)

Médio Prazo:
- Seed de dados (script prisma/seed)
- Health check (/health) + readiness para orquestradores
- Logs estruturados (pino ou nest-winston)
- Métricas (Prometheus + endpoint /metrics)
- Versionamento de API (ex: prefixo /v1)

Longo Prazo:
- Upload para storage externo (S3 / GCS)
- Caching de agregações (Redis)
- Refresh tokens e expiração curta do access token
- Auditoria (quem criou/editou movimentos)
- CI/CD (GitHub Actions com lint/test/build)

## Contribuição

1. Fork / branch feature
2. Mantenha commits pequenos e descritivos
3. Abra PR com descrição clara

## Licença

MIT

---
Se algo estiver desatualizado, abra uma issue ou PR. Boa contribuição! 🙌