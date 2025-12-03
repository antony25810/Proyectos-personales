# Etapa de construcción
FROM node:16-alpine AS build
WORKDIR /app

# Copia los archivos de configuración y dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copia el resto del código fuente
COPY . .

# Construye la aplicación React
RUN npm run build

# Etapa de ejecución con Nginx
FROM nginx:1.23-alpine
WORKDIR /usr/share/nginx/html

# Copia los archivos de la etapa de construcción
COPY --from=build /app/build .

# Copia la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto para el servidor web
EXPOSE 80

# Ejecuta Nginx
CMD ["nginx", "-g", "daemon off;"]