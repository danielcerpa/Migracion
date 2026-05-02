// ============================================================
// index.js — Servidor principal (punto de entrada del back)
// ============================================================
// Este archivo arranca el servidor Express, configura los
// middlewares globales y registra todas las rutas de la API.
// Se ejecuta con: node index.js (o vía npm run dev)
// ============================================================

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carga las variables del archivo .env

// Importación de rutas agrupadas por dominio
const rutasModulo = require('./rutas/rutasModulo');
const rutasAuth = require('./rutas/rutasAuth');
const rutasUsuario = require('./rutas/rutasUsuario');
const rutasPerfil = require('./rutas/rutasPerfil');
const rutasCatalogo = require('./rutas/rutasCatalogo');
const rutasPrestamo = require('./rutas/rutasPrestamo');
const rutasFototeca = require('./rutas/rutasFototeca');
const rutasEspecimen = require('./rutas/rutasEspecimen');
const rutasAprobaciones = require('./rutas/rutasAprobaciones');


const app = express();
const PORT = process.env.PORT || 3000; // Puerto definido en .env o 3000 por defecto

// --- Middlewares globales ---
app.use(cors());           // Permite peticiones desde el frontend (distinto origen/puerto)
app.use(express.json());   // Permite leer el body de las peticiones en formato JSON

// --- Registro de rutas ---
app.use('/api/modules',   rutasModulo);   // GET  /api/modules  → lista módulos del usuario
app.use('/api/login',     rutasAuth);     // POST /api/login    → autenticación de usuario
app.use('/api/users',     rutasUsuario);  // GET  /api/users    → lista todos los usuarios
app.use('/api/profiles',  rutasPerfil);   // GET  /api/profiles → lista todos los perfiles
app.use('/api/catalogos', rutasCatalogo); // CRUD /api/catalogos → catálogos del sistema
app.use('/api/prestamos', rutasPrestamo); // CRUD /api/prestamos → módulo de préstamos
app.use('/api/fototeca', rutasFototeca); // CRUD /api/fototeca → módulo fototeca
app.use('/api/especimenes', rutasEspecimen); // CRUD /api/especimenes → registro de especímenes
app.use('/api/aprobaciones', rutasAprobaciones); // CRUD /api/aprobaciones → gestión de aprobaciones



// Inicia el servidor y escucha en el puerto indicado
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
