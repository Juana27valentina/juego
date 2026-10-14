CREATE DATABASE IF NOT EXISTS tiquetera_db;
USE tiquetera_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS actividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dimension VARCHAR(100) NOT NULL,
    actividad VARCHAR(200) NOT NULL,
    puntos INT NOT NULL,
    extra BOOLEAN DEFAULT FALSE,
    evidencia VARCHAR(200),
    frecuencia ENUM('Mensual','Trimestral','Semestral','Anual') NOT NULL,
    responsable VARCHAR(100) NOT NULL,
    estado ENUM('Pendiente','En Progreso','Completado','Atrasado') DEFAULT 'Pendiente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de prueba usuarios
INSERT INTO usuarios (nombre, email, cargo, departamento) VALUES 
('Juan Pérez', 'juan.perez@escuela.edu', 'Docente de Matemáticas', 'Coordinación Académica'),
('María Gómez', 'maria.gomez@escuela.edu', 'Psicóloga', 'Equipo Pedagógico'),
('Carlos Ruiz', 'carlos.ruiz@escuela.edu', 'Docente de Historia', 'Coordinación Académica');

-- Insertar datos de prueba actividades
INSERT INTO actividades (dimension, actividad, puntos, extra, evidencia, frecuencia, responsable, estado) VALUES 
('Administrativo', 'Revisión de documentación', 10, FALSE, 'documentos.pdf', 'Mensual', 'Coordinación Académica', 'Pendiente'),
('Participación Técnica', 'Taller de herramientas', 15, TRUE, 'registro_video.mp4', 'Trimestral', 'Equipo Pedagógico', 'En Progreso');
