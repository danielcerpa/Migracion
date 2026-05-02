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
            // 3. Obtener permisos/perfil del usuario (igual que AuthControlador.js)
            // Se toma el primer perfil encontrado en la tabla 'permissions'
            $stmtPerms = $pdo->prepare("
                SELECT p.nickname, p.idProfile 
                FROM permissions perm
                JOIN profile p ON perm.idProfile = p.idProfile
                WHERE perm.idUser = ?
                LIMIT 1
            ");
            $stmtPerms->execute([$user['idUser']]);
            $perm = $stmtPerms->fetch(PDO::FETCH_ASSOC);
            
            $profileId = $perm ? $perm['idProfile'] : null;
            $profileName = $perm ? $perm['nickname'] : null;

            // 4. Estructurar respuesta idéntica a @[Private]
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $user['idUser'],
                    "name" => $user['name'],
                    "email" => $user['email'],
                    "profileId" => $profileId,
                    "profileName" => $profileName
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Credenciales incorrectas"]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Credenciales incorrectas o usuario inactivo"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error de servidor: " . $e->getMessage()]);
}
?>
