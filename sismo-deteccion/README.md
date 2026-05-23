# Sistema de Visualización de Sismos

## Descripción del Proyecto
Proyecto full-stack para cargar, consultar y visualizar datos sísmicos con backend Spring Boot, frontend React y cliente móvil Expo.

## Características Principales
- Registro de usuarios
- Autenticación con Spring Security
- Gestión de roles (USER, ADMIN)
- Visualización de sismos
- Panel de administración para gestión de usuarios (solo para administradores)
- Mapa y simulación de propagación de ondas sísmicas

## Requisitos Previos
- Java 17
- Node.js 22+
- npm 11+
- Docker y Docker Compose
- Android Studio (opcional, para build nativo móvil)

## Configuración del Entorno

### 1. Base de Datos
- Con Docker Compose, MySQL y Neo4j se levantan automáticamente.
- Si ejecutas local sin Docker, crea la base `sismos_db` en MySQL.

- Credenciales de base de datos (configuradas en `application.properties`):
  - Usuario: `sismouser`
  - Contraseña: `sismopassword`
  - Base de datos: `sismos_db`

### 2. Configuración de Base de Datos
El proyecto incluye un `init.sql` que se ejecutará automáticamente al iniciar la aplicación. Este script:
- Crea la base de datos
- Configura tablas de usuarios y roles
- Inserta roles predeterminados (ROLE_ADMIN, ROLE_USER)
- Crea un usuario de base de datos

### 3. Variables y CORS
- El backend usa `app.cors.allowed-origin-patterns` para definir orígenes permitidos con credenciales.
- En Docker Compose se inyecta `APP_CORS_ALLOWED_ORIGIN_PATTERNS` para entornos de desarrollo local.

## Instalación y Ejecución

### Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd sismo-deteccion
```

### Opción A: Levantar todo con Docker
```bash
docker-compose up --build
```

### Opción B: Ejecutar por módulos (local)

#### Backend
```bash
cd sismo-deteccion
./gradlew bootRun
```

#### Frontend web
```bash
cd sismos-frontend
npm install
npm start
```

#### App móvil (Expo)
```bash
cd sismo-mobile-expo
npm install
npm run start
```

## Acceso a la Aplicación
- URL Base: `http://localhost:3000`
- Páginas:
  - Login: `/login`
  - Registro: `/registro`
  - Home: `/home`
  - Gestión de Usuarios (Admin): `/admin/gestion-usuarios`

## Usuarios Predeterminados
El sistema se inicializa con roles de usuario. Puedes registrar nuevos usuarios desde la página de registro.

## Pruebas
Comandos recomendados:
```bash
cd sismo-deteccion
./gradlew build -x test

cd ../sismos-frontend
npm run build

cd ../sismo-mobile-expo
npx expo-doctor
```

## Seguridad
- Contraseñas encriptadas con BCrypt
- Roles de usuario (USER, ADMIN)
- Protección de rutas según roles
- Aplicación basada en sesiones
- CORS restringido por lista de orígenes permitidos

## Tecnologías Utilizadas
- Java 17
- Spring Boot 3.4.x
- Spring Security
- React 19
- Expo SDK 55
- MySQL 8.4
- Neo4j 5
- Docker

## Consideraciones de Seguridad
- CSRF deshabilitado para simplificar integración API (revisar en producción)
- Validación de contraseñas
- Manejo de errores personalizado

## Capturas de pantalla
![image](https://github.com/user-attachments/assets/c7a48bff-90ba-4895-861f-49c47c811560)

![image](https://github.com/user-attachments/assets/18522cc3-f3db-4bb6-a787-a0d2b832911d)

![image](https://github.com/user-attachments/assets/615e533b-c51c-40d1-8ee1-1aa85195d2b2)

