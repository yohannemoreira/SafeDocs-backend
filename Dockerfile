# Node.js 20 como base
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    bash \
    curl \
    tzdata

# Definir timezone
ENV TZ=America/Sao_Paulo

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci && npm cache clean --force

# Copiar código fonte
COPY . .

# Construir aplicação
RUN npm run build

# Remover devDependencies para reduzir tamanho da imagem
RUN npm ci --only=production && npm cache clean --force

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Alterar propriedade dos arquivos
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expor porta da aplicação
EXPOSE 3000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
