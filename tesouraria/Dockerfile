# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependências do sistema necessárias (ex: openssl para Prisma)
RUN apk add --no-cache openssl

# Copia manifests
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./ 2>/dev/null || true
COPY prisma ./prisma
COPY tsconfig*.json ./
COPY src ./src

# Instala dependências
RUN npm install --legacy-peer-deps

# Gera o Prisma Client
RUN npx prisma generate

# Compila o projeto
RUN npm run build

# ---------- Production stage ----------
FROM node:20-alpine AS prod
WORKDIR /app
RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Copia apenas o necessário do build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Copia script de inicialização opcional (se existir futuramente)
# COPY docker-entrypoint.sh ./
# RUN chmod +x docker-entrypoint.sh

# Porta exposta
EXPOSE 3000

# Healthcheck simples (ajustar endpoint se criar /health)
# HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
