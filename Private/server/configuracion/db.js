// ============================================================
// db.js — Configuración y conexión a la base de datos MySQL
// ============================================================
// Crea un pool de conexiones reutilizables usando las
// credenciales definidas en el archivo .env del servidor.
// Un pool evita abrir/cerrar una conexión en cada petición,
// lo que hace el servidor mucho más eficiente.
// ============================================================

const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Lee el .env desde la raíz del servidor

// Parámetros de conexión (todos vienen del archivo .env)
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,  // 3306 es el puerto estándar de MySQL
  connectionLimit: 10,    // Máximo de conexiones simultáneas permitidas
  queueLimit: 0,          // Sin límite en la cola de espera
  enableKeepAlive: true,  // Mantiene las conexiones vivas para evitar desconexiones
  keepAliveInitialDelay: 0
};

// Crea el pool de conexiones con la configuración anterior
const pool = mysql.createPool(dbConfig);

// Prueba la conexión al iniciar el servidor para detectar problemas de inmediato
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('Asegúrate de que el servicio MySQL esté corriendo en el puerto', dbConfig.port);
    }
  } else {
    console.log('Conexión exitosa a la base de datos MySQL');
    connection.release(); // Libera la conexión de vuelta al pool
  }
});

// Exporta el pool con soporte de Promesas (permite usar async/await en los modelos)
module.exports = pool.promise();
