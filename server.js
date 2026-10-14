require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de la base de datos MariaDB / MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tiquetera_db'
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// === RUTAS CRUD PARA USUARIOS ===

// 1. Obtener todos los usuarios (READ)
app.get('/api/usuarios', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

// 2. Obtener un usuario por ID (READ)
app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el usuario' });
    }
});

// 3. Crear un nuevo usuario (CREATE)
app.post('/api/usuarios', async (req, res) => {
    const { nombre, email, cargo, departamento } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, cargo, departamento) VALUES (?, ?, ?, ?)',
            [nombre, email, cargo, departamento]
        );
        res.status(201).json({ id: result.insertId, nombre, email, cargo, departamento });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
});

// 4. Actualizar un usuario (UPDATE)
app.put('/api/usuarios/:id', async (req, res) => {
    const { nombre, email, cargo, departamento } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE usuarios SET nombre = ?, email = ?, cargo = ?, departamento = ? WHERE id = ?',
            [nombre, email, cargo, departamento, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
});

// 5. Eliminar un usuario (DELETE)
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
});

// ---------- Endpoints CRUD para Actividades ----------
app.get('/api/actividades', (req, res) => {
    pool.query('SELECT * FROM actividades', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/actividades', (req, res) => {
    const { dimension, actividad, puntos, extra, evidencia, frecuencia, responsable, estado } = req.body;
    pool.query(
        'INSERT INTO actividades (dimension, actividad, puntos, extra, evidencia, frecuencia, responsable, estado) VALUES (?,?,?,?,?,?,?,?)',
        [dimension, actividad, puntos, extra, evidencia, frecuencia, responsable, estado || 'Pendiente'],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, dimension, actividad, puntos, extra, evidencia, frecuencia, responsable, estado: estado || 'Pendiente' });
        }
    );
});

app.put('/api/actividades/:id', (req, res) => {
    const { id } = req.params;
    const { dimension, actividad, puntos, extra, evidencia, frecuencia, responsable, estado } = req.body;
    pool.query(
        'UPDATE actividades SET dimension=?, actividad=?, puntos=?, extra=?, evidencia=?, frecuencia=?, responsable=?, estado=? WHERE id=?',
        [dimension, actividad, puntos, extra, evidencia, frecuencia, responsable, estado, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ affectedRows: result.affectedRows });
        }
    );
});

app.delete('/api/actividades/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM actividades WHERE id=?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ affectedRows: result.affectedRows });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`Conectado a la base de datos MySQL/MariaDB: ${dbConfig.database}`);
});
