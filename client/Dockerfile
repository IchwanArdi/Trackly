### STAGE 1 : BUILDER ###
# Stage untuk compile TypeScript + build Vite jadi static files
FROM node:22-alpine AS builder

WORKDIR /app

# Menyalin file package.json dan package-lock.json
COPY package.json package-lock.json ./

# Instal dependensi
RUN npm ci

# Menyalin source code
COPY . .

# VITE_API_URL harus tersedia SAAT BUILD, karena Vite inline env ke bundle JS
# ARG bisa di-override lewat --build-arg saat docker build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Compile TypeScript + build production (hasil masuk ke folder dist/)
RUN npm run build


### STAGE 2 : RUNNER ###
# Stage untuk serve static files pakai nginx
FROM nginx:alpine AS runner

# Menghapus konfigurasi default nginx
RUN rm /etc/nginx/conf.d/default.conf

# Menyalin konfigurasi nginx custom (buat handle SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Menyalin hasil build dari stage "builder" ke folder yang di-serve nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]