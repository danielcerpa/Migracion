<?php
// modules.php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM module");
    $modules = $stmt->fetchAll();
    echo json_encode($modules);
} else {
    http_response_code(405);
}
?>
