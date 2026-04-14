FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src ./src
COPY tsconfig*.json ./

# Compilar
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar código compilado del builder
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Crear directorio de uploads
RUN mkdir -p uploads

# Comando de inicio
CMD ["node", "dist/main.js"]
