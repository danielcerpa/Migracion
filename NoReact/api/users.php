<?php
// users.php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM user");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Fetch permissions for each user
            foreach ($users as &$user) {
                $stmtPerms = $pdo->prepare("SELECT idModule, idProfile FROM permissions WHERE idUser = ?");
                $stmtPerms->execute([$user['idUser']]);
                $user['permisos'] = $stmtPerms->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode($users);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Datos inválidos"]);
            exit;
        }
        
        try {
            $pdo->beginTransaction();
            
            $sql = "INSERT INTO user (name, last_name, second_last_name, email, password, status) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            
            // Usar password_hash (BCRYPT) para compatibilidad con el proyecto original
            $passwordRaw = $data['password'] ?? '123';
            $hashedPassword = password_hash($passwordRaw, PASSWORD_BCRYPT);
            $status = isset($data['status']) ? (int)$data['status'] : 1;
            
            $stmt->execute([
                $data['name'], 
                $data['last_name'] ?? null, 
                $data['second_last_name'] ?? null, 
                $data['email'], 
                $hashedPassword, 
                $status
            ]);
            $userId = $pdo->lastInsertId();

            // Insert permissions
            if (isset($data['permisos']) && is_array($data['permisos'])) {
                $sqlPerm = "INSERT INTO permissions (idUser, idModule, idProfile) VALUES (?, ?, ?)";
                $stmtPerm = $pdo->prepare($sqlPerm);
                foreach ($data['permisos'] as $perm) {
                    $stmtPerm->execute([$userId, $perm['idModule'], $perm['idProfile']]);
                }
            }

            $pdo->commit();
            echo json_encode(["idUser" => $userId, "message" => "Usuario creado"]);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el ID del usuario"]);
            exit;
        }
        $id = (int)$_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $pdo->beginTransaction();

            // Prepare dynamic update for user fields
            $updates = [];
            $params = [];
            
            if (isset($data['name'])) { $updates[] = "name=?"; $params[] = $data['name']; }
            if (isset($data['last_name'])) { $updates[] = "last_name=?"; $params[] = $data['last_name']; }
            if (isset($data['second_last_name'])) { $updates[] = "second_last_name=?"; $params[] = $data['second_last_name']; }
            if (isset($data['email'])) { $updates[] = "email=?"; $params[] = $data['email']; }
            if (isset($data['status'])) { $updates[] = "status=?"; $params[] = (int)$data['status']; }
            
            if (!empty($data['password'])) {
                $updates[] = "password=?";
                $params[] = password_hash($data['password'], PASSWORD_BCRYPT);
            }

            if (!empty($updates)) {
                $sql = "UPDATE user SET " . implode(", ", $updates) . " WHERE idUser=?";
                $params[] = $id;
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            }

            // Update permissions
            if (isset($data['permisos']) && is_array($data['permisos'])) {
                $pdo->prepare("DELETE FROM permissions WHERE idUser=?")->execute([$id]);
                $sqlPerm = "INSERT INTO permissions (idUser, idModule, idProfile) VALUES (?, ?, ?)";
                $stmtPerm = $pdo->prepare($sqlPerm);
                foreach ($data['permisos'] as $perm) {
                    $stmtPerm->execute([$id, $perm['idModule'], $perm['idProfile']]);
                }
            }

            $pdo->commit();
            echo json_encode(["message" => "Usuario actualizado"]);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el ID del usuario"]);
            exit;
        }
        $id = (int)$_GET['id'];
        try {
            // Soft delete
            $stmt = $pdo->prepare("UPDATE user SET status = 0 WHERE idUser = ?");
            $stmt->execute([$id]);
            echo json_encode(["message" => "Usuario dado de baja"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}
?>
