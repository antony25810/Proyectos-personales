# Sistema de Visualización de Sismos

## Descripción del Proyecto
Este es un proyecto de aplicación web el cual da varias opciones de visualización de datos sobre sismos el cual almacena los datos cargando un csv

## Características Principales
- Registro de usuarios
- Autenticación con Spring Security
- Gestión de roles (USER, ADMIN)
- Visualización de sismos
- Panel de administración para gestión de usuarios (solo para administradores)

## Requisitos Previos
- Java 21
- Gradle
- MySQL 8.0+
- React
- Docker

## Configuración del Entorno

### 1. Base de Datos
- Crear base de datos MySQL:
  ```sql
  CREATE DATABASE sismos_db;
  ```

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

### 3. Dependencias
Las dependencias principales incluyen:
- Spring Boot Web
- Spring Security
- Spring Data JPA
- MySQL Connector
- Bootstrap (WebJars)
- Neo4j

## Instalación y Ejecución

### Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd sismo-deteccion
```

### Compilar y ejecutar el Proyecto
```bash
docker-compose up --build
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
Ejecutar pruebas unitarias:
```bash
```

## Seguridad
- Contraseñas encriptadas con BCrypt
- Roles de usuario (USER, ADMIN)
- Protección de rutas según roles
- Aplicación basada en sesiones

## Tecnologías Utilizadas
- Java 21
- Spring Boot 3.4.2
- Spring Security
- React
- MySQL
- Neo4j
- Bootstrap 5
- Docker

## Consideraciones de Seguridad
- CSRF deshabilitado para simplicidad (ajustar en producción)
- Validación de contraseñas
- Manejo de errores personalizado

## Capturas de pantalla
![image](https://github.com/user-attachments/assets/c7a48bff-90ba-4895-861f-49c47c811560)

![image](https://github.com/user-attachments/assets/18522cc3-f3db-4bb6-a787-a0d2b832911d)

![image](https://github.com/user-attachments/assets/615e533b-c51c-40d1-8ee1-1aa85195d2b2)

