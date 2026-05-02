<?php
// profiles.php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM profile");
        $profiles = $stmt->fetchAll();
        echo json_encode($profiles);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Datos inválidos"]);
            exit;
        }
        
        $sql = "INSERT INTO profile (nickname, description, key_add, key_delete, key_edit, key_export) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        
        try {
            $stmt->execute([
                $data['nickname'], 
                $data['description'] ?? null, 
                isset($data['key_add']) && $data['key_add'] ? 1 : 0,
                isset($data['key_delete']) && $data['key_delete'] ? 1 : 0,
                isset($data['key_edit']) && $data['key_edit'] ? 1 : 0,
                isset($data['key_export']) && $data['key_export'] ? 1 : 0
            ]);
            echo json_encode(["idProfile" => $pdo->lastInsertId(), "message" => "Perfil creado"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el ID del perfil"]);
            exit;
        }
        $id = (int)$_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $sql = "UPDATE profile SET nickname=?, description=?, key_add=?, key_delete=?, key_edit=?, key_export=? WHERE idProfile=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['nickname'], 
                $data['description'] ?? null, 
                isset($data['key_add']) && $data['key_add'] ? 1 : 0,
                isset($data['key_delete']) && $data['key_delete'] ? 1 : 0,
                isset($data['key_edit']) && $data['key_edit'] ? 1 : 0,
                isset($data['key_export']) && $data['key_export'] ? 1 : 0,
                $id
            ]);

            echo json_encode(["message" => "Perfil actualizado"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el ID del perfil"]);
            exit;
        }
        $id = (int)$_GET['id'];
        // Ensure no user uses this profile before deleting? Or just delete. The original code just deletes.
        try {
            $stmt = $pdo->prepare("DELETE FROM profile WHERE idProfile = ?");
            $stmt->execute([$id]);
            echo json_encode(["message" => "Perfil eliminado"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "No se puede eliminar el perfil porque está en uso u ocurrió un error: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
}
?>
