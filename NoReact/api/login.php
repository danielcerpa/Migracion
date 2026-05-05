<?php
// login.php
require 'db.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Correo y contraseña son requeridos"]);
    exit;
}

try {
    // 1. Buscar usuario por email (Tabla 'user' según v2.sql)
    $stmt = $pdo->prepare("SELECT * FROM user WHERE email = ? AND status = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // 2. Verificar contraseña con BCRYPT
        $isPasswordValid = false;
        
        if (password_verify($password, $user['password'])) {
            $isPasswordValid = true;
        } else if ($password === $user['password']) {
            // Soporte para contraseñas en texto plano si existen (legacy)
            $isPasswordValid = true;
        }

        if ($isPasswordValid) {
            // 3. Obtener permisos detallados por módulo (excluir "Sin Acceso")
            $stmtPerms = $pdo->prepare("
                SELECT 
                    m.idModule, 
                    m.name as moduleName,
                    p.nickname as profileNickname,
                    p.key_add, 
                    p.key_edit, 
                    p.key_delete, 
                    p.key_export
                FROM permissions perm
                JOIN module m ON perm.idModule = m.idModule
                JOIN profile p ON perm.idProfile = p.idProfile
                WHERE perm.idUser = ? AND p.nickname <> 'Sin Acceso'
            ");
            $stmtPerms->execute([$user['idUser']]);
            $permissions = $stmtPerms->fetchAll(PDO::FETCH_ASSOC);

            // 4. Estructurar respuesta con el usuario y sus permisos
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $user['idUser'],
                    "name" => $user['name'],
                    "email" => $user['email'],
                    "status" => (int)$user['status']
                ],
                "permissions" => $permissions
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Contraseña incorrecta"]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Correo no encontrado"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error de servidor: " . $e->getMessage()]);
}
?>
