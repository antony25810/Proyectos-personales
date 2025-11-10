# Sistema de Alerta y Visualización de Sismos - Gestión de Usuarios 

## Descripción del Proyecto
Este es un proyecto de aplicación web de gestión de usuarios desarrollado con Spring Boot, que incluye funcionalidades de autenticación, registro, perfil de usuario y administración.

## Características Principales
- Registro de usuarios
- Autenticación con Spring Security
- Gestión de roles (USER, ADMIN)
- Perfil de usuario
- Panel de administración para gestión de usuarios

## Requisitos Previos
- Java 21
- Maven
- MySQL 8.0+

## Configuración del Entorno

### 1. Base de Datos
- Crear base de datos MySQL:
  ```sql
  CREATE DATABASE tarea2;
  ```

- Credenciales de base de datos (configuradas en `application.properties`):
  - Usuario: `admin`
  - Contraseña: `admin`
  - Base de datos: `tarea2`

### 2. Configuración de Base de Datos
El proyecto incluye un `schema.sql` que se ejecutará automáticamente al iniciar la aplicación. Este script:
- Crea la base de datos
- Configura tablas de usuarios y roles
- Inserta roles predeterminados (ROLE_ADMIN, ROLE_USER)
- Crea un usuario de base de datos

### 3. Dependencias
Las dependencias principales incluyen:
- Spring Boot Web
- Spring Security
- Spring Data JPA
- Thymeleaf
- MySQL Connector
- Bootstrap (WebJars)

## Instalación y Ejecución

### Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd HOLASPRING6CV3
```

### Compilar el Proyecto
```bash
mvn clean install
```

### Ejecutar la Aplicación
```bash
mvn spring-boot:run
```

## Acceso a la Aplicación
- URL Base: `http://localhost:8080`
- Páginas:
  - Login: `/login`
  - Registro: `/registro`
  - Home: `/home`
  - Perfil: `/perfil`
  - Gestión de Usuarios (Admin): `/admin/gestion-usuarios`

## Usuarios Predeterminados
El sistema se inicializa con roles de usuario. Puedes registrar nuevos usuarios desde la página de registro.

## Pruebas
Ejecutar pruebas unitarias:
```bash
mvn test
```

## Seguridad
- Contraseñas encriptadas con BCrypt
- Roles de usuario (USER, ADMIN)
- Protección de rutas según roles

## Tecnologías Utilizadas
- Java 21
- Spring Boot 3.4.2
- Spring Security
- Thymeleaf
- MySQL
- Bootstrap 5

## Consideraciones de Seguridad
- CSRF deshabilitado para simplicidad (ajustar en producción)
- Validación de contraseñas
- Manejo de errores personalizado

## Capturas de pantalla
![image](https://github.com/user-attachments/assets/c7a48bff-90ba-4895-861f-49c47c811560)

![image](https://github.com/user-attachments/assets/18522cc3-f3db-4bb6-a787-a0d2b832911d)

![image](https://github.com/user-attachments/assets/615e533b-c51c-40d1-8ee1-1aa85195d2b2)



