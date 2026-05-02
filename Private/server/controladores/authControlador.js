// ============================================================
// authControlador.js — Controlador de autenticación
// ============================================================
// Maneja la lógica central del login: intercepta solicitudes HTTP,
// extrae credenciales, interroga a la base de datos (Modelo)
// y orquesta permisos para retornar la respuesta JSON al cliente.
// ============================================================

const UsuarioModelo = require('../modelos/usuarioModelo'); // Importamos la capa encargada de hacer consultas SQL a la tabla de usuarios

class AuthControlador {

    // Método estático asíncrono para gestionar peticiones HTTP vía método POST en la ruta /api/login
    // Recibe `req` (Petición entrante del frontend) y `res` (Objeto de repuesta que enviaremos de vuelta)
    static async login(req, res) {
        // Desestructuración: extraemos 'email' y 'password' que vienen encapsulados en el cuerpo (body) del request JSON del frontend.
        const { email, password } = req.body; 

        try {
            // 1. Invocamos al modelo pasándole el correo y contraseña limpias para que ejecute el `SELECT` a la BD
            const user = await UsuarioModelo.authenticate(email, password);

            // 2. Validación de fallo: Si 'user' es nulo o indefinido (no lo encontró la BD)
            if (!user) {
                // Interrumpimos la ejecución con return y enviamos un estado HTTP 401 (Unauthorized) con un JSON de error.
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            // 3. Validación de éxito: Si el usuario existe, se pide consultar los perfiles (roles) o permisos anexos a su ID de usuario.
            const permissions = await UsuarioModelo.getUserPermissions(user.idUser);

            // Inicializamos las variables que albergarán el nombre de su rol (ej. "Admin") y su identificador numérico.
            let profileId = null;
            let profileName = null;

            // 4. Se asigna el primer perfil que la BD haya regresado.
            // Si el motor SQL confirmó listados de roles (`permissions` existe y trae más de 0 elementos)
            if (permissions && permissions.length > 0) {
                profileName = permissions[0].nickname; // Se almacena en la variable ej: 'Supervisor'
                profileId = permissions[0].idProfile;  // Se almacena el número de rol ej: 1
            }

            // 5. Estructuramos una respuesta de salida exitosa enviando un objeto JSON.
            // Esto es exactamente lo que recibirá el cliente web en forma de respuesta asíncrona (Promise resolved).
            res.json({
                success: true, // Bandera booleana de éxito para validar en el frontend
                user: {
                    id: user.idUser,       // ID real tomado de la BD
                    name: user.name,       // Nombre extraído de la BD
                    email: user.email,     // Correo de la BD
                    profileId: profileId,  // ID del perfil parseado en el paso 4
                    profileName: profileName // Nombre del rol parseado en el paso 4
                }
            });

        } catch (error) {
            // Error inesperado en el try{} principal (Ejemplo: Caída de la base de datos, error de red o de sintaxis interna)
            console.error('Login error:', error); // Log crudo a consola de NodeJS para desarrolladores o herramientas de monitoreo
            // Se manda código 500 (Internal Server Error) para no revelar vulnerabilidades de código o stack trace al lado cliente.
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

// Exportamos la clase completa para poder inyectarla en `rutasAuth.js` haciéndola disponible al enrutador de Express
module.exports = AuthControlador;
