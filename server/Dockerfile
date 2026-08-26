### STAGE 1 : DEPS ###
# Stage dependensi untuk menginstal dependensi
FROM node:22-alpine AS deps

WORKDIR /app

# Menyalin file package.json dan package-lock.json
COPY package.json package-lock.json ./

# Instal dependensi (termasuk devDependencies, karena prisma CLI ada di sana)
RUN npm ci


### STAGE 2 : BUILDER ###
# Stage untuk generate prisma client
FROM node:22-alpine AS builder

WORKDIR /app

# Menyalin dependensi dari stage "deps"
COPY --from=deps /app/node_modules ./node_modules

# Menyalin source code (termasuk folder prisma/)
COPY . .

# Prisma generate butuh DATABASE_URL saat build, meskipun cuma placeholder
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DIRECT_URL="postgresql://user:pass@localhost:5432/db"

# Generate Prisma Client (masuk ke node_modules/.prisma & @prisma/client)
RUN npx prisma generate


### STAGE 3 : RUNNER ###
# Stage untuk menjalankan aplikasi
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Membuat user & group non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nodejs

# Menyalin node_modules yang sudah kena prisma generate dari stage "builder"
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Menyalin source code aplikasi (bukan dist, karena tidak ada build/transpile)
COPY --from=builder --chown=nodejs:nodejs /app/app.js ./app.js
COPY --from=builder --chown=nodejs:nodejs /app/server.js ./server.js
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.js ./prisma.config.js
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Ganti ke user non-root
USER nodejs

EXPOSE 3000

# Menjalankan aplikasi
CMD ["node", "server.js"]