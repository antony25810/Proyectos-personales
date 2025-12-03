-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 27-04-2025 a las 03:01:07
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sismos_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(64) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sismos`
--

DROP TABLE IF EXISTS `sismos`;
CREATE TABLE IF NOT EXISTS `sismos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `hora` varchar(255) DEFAULT NULL,
  `magnitud` double DEFAULT NULL,
  `latitud` double NOT NULL,
  `longitud` double NOT NULL,
  `profundidad` double NOT NULL,
  `referencia_localizacion` varchar(255) DEFAULT NULL,
  `fecha_utc` date NOT NULL,
  `hora_utc` varchar(255) DEFAULT NULL,
  `estatus` varchar(255) DEFAULT NULL,
  `fechautc` date DEFAULT NULL,
  `horautc` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sismos_magnitud` (`magnitud`),
  KEY `idx_sismos_fecha` (`fecha`),
  KEY `idx_sismos_ubicacion` (`latitud`,`longitud`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(64) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_roles`
--

DROP TABLE IF EXISTS `usuario_roles`;
CREATE TABLE IF NOT EXISTS `usuario_roles` (
  `usuario_id` bigint NOT NULL,
  `rol_id` bigint NOT NULL,
  PRIMARY KEY (`usuario_id`,`rol_id`),
  KEY `FKbt9i9yrb9ug88xnh82n9m60pr` (`rol_id`),
  CONSTRAINT FK_usuario_id FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT FK_rol_id FOREIGN KEY (rol_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;

-- Insertar roles básicos
INSERT INTO roles (nombre) VALUES ('ROLE_USER'), ('ROLE_ADMIN') ON DUPLICATE KEY UPDATE nombre=nombre;

INSERT INTO usuarios (nombre, email, password) 
VALUES ('Admin', 'prueba@example.com', '$2a$10$JQkTQkv1YkVd5fMWpfgUreSzCcnqGEnQUanTu9PZxxlRgoiY6UOvG') 
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Asignar rol al usuario de Admin
INSERT INTO usuario_roles (usuario_id, rol_id) 
SELECT u.id, r.id FROM usuarios u, roles r 
WHERE u.nombre = 'Admin' AND r.nombre = 'ROLE_ADMIN' 
ON DUPLICATE KEY UPDATE usuario_id=usuario_id;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
