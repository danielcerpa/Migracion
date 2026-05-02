// ============================================================
// usuarioModelo.js — Modelo de usuarios
// ============================================================
// Contiene todas las consultas SQL relacionadas a usuarios.
// Es la única capa que toca directamente la base de datos
// para operaciones de usuario.
// ============================================================

const db = require('../configuracion/db');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;


class UsuarioModelo {

    // Busca un usuario por email y verifica su password hash. Devuelve el usuario si existe, o null si no.
    static async authenticate(email, password) {
        // 1. Buscamos al usuario por correo solamente (que sea único)
        const [users] = await db.query(
            'SELECT * FROM user WHERE email = ? AND status = 1',
            [email]
        );

        // 2. Si no existe el usuario, retornamos null
        if (users.length === 0) return null;

        const user = users[0];

        // 3. Comparamos la contraseña en texto plano con el hash guardado en la BD
        const isMatch = await bcrypt.compare(password, user.password);

        // 4. Si coincide, retornamos el usuario; si no, null
        return isMatch ? user : null;
    }

    // Obtiene los perfiles/permisos asignados a un usuario por su ID
    static async getUserPermissions(userId) {
        const [permissions] = await db.query(
            `SELECT p.nickname, p.idProfile 
             FROM permissions perm
             JOIN profile p ON perm.idProfile = p.idProfile
             WHERE perm.idUser = ?`,
            [userId]
        );
        return permissions;
    }

    // Devuelve todos los usuarios registrados en el sistema, junto con sus permisos
    static async getAllUsers() {
        const [rows] = await db.query('SELECT * FROM user');
        const [perms] = await db.query('SELECT idUser, idModule, idProfile FROM permissions');

        // Mapeamos los permisos de cada usuario
        const users = rows.map(user => {
            return {
                ...user,
                permisos: perms.filter(p => p.idUser === user.idUser).map(p => ({
                    idModule: p.idModule,
                    idProfile: p.idProfile
                }))
            };
        });

        return users;
    }

    // Crea un nuevo usuario y sus permisos de manera transaccional
    static async createUser(userData, permissions) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Hashear la contraseña antes de guardarla
            const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

            const [result] = await connection.query(
                `INSERT INTO user (name, last_name, second_last_name, email, password, status)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userData.name, userData.last_name, userData.second_last_name, userData.email, hashedPassword, 1]
            );

            const newUserId = result.insertId;

            if (permissions && permissions.length > 0) {
                for (const perm of permissions) {
                    await connection.query(
                        `INSERT INTO permissions (idUser, idModule, idProfile) VALUES (?, ?, ?)`,
                        [newUserId, perm.idModule, perm.idProfile]
                    );
                }
            }

            await connection.commit();
            return newUserId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Actualiza información y permisos de un usuario de manera transaccional
    static async updateUser(userId, userData, permissions) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const updates = [];
            const values = [];

            if (userData.name !== undefined) { updates.push('name = ?'); values.push(userData.name); }
            if (userData.last_name !== undefined) { updates.push('last_name = ?'); values.push(userData.last_name); }
            if (userData.second_last_name !== undefined) { updates.push('second_last_name = ?'); values.push(userData.second_last_name); }
            if (userData.password) { 
                const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
                updates.push('password = ?'); 
                values.push(hashedPassword); 
            }
            if (userData.status !== undefined) { updates.push('status = ?'); values.push(userData.status); }

            if (updates.length > 0) {
                values.push(userId);
                await connection.query(
                    `UPDATE user SET ${updates.join(', ')} WHERE idUser = ?`,
                    values
                );
            }

            if (permissions && permissions.length > 0) {
                await connection.query(`DELETE FROM permissions WHERE idUser = ?`, [userId]);
                for (const perm of permissions) {
                    await connection.query(
                        `INSERT INTO permissions (idUser, idModule, idProfile) VALUES (?, ?, ?)`,
                        [userId, perm.idModule, perm.idProfile]
                    );
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Baja lógica de un usuario (status = 0)
    static async deleteUser(userId) {
        const [result] = await db.query(
            'UPDATE user SET status = 0 WHERE idUser = ?',
            [userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = UsuarioModelo;
