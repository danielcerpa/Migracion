<?php
// modules.php — alineado con sistemas/Private/server (rutasModulo + moduloModelo)
require 'db.php';

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$userId = isset($_GET['userId']) ? (int) $_GET['userId'] : 0;

try {
    if ($userId > 0) {
        $sql = "
            SELECT m.*, pr.key_add, pr.key_edit, pr.key_delete, pr.key_export
            FROM module m
            JOIN permissions p ON m.idModule = p.idModule
            JOIN profile pr ON p.idProfile = pr.idProfile
            WHERE m.status = 1 AND p.idUser = ? AND pr.nickname <> 'Sin Acceso'
            ORDER BY m.idModule ASC
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        $stmt = $pdo->query('SELECT * FROM module WHERE status = 1 ORDER BY idModule ASC');
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
