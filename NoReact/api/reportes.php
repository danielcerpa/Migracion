<?php
// reportes.php — resumen operativo (conteos) para el módulo Reportes
require 'db.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    $out = [];

    $stmt = $pdo->query('SELECT COUNT(*) AS c FROM especimenes WHERE status = 1');
    $out['especimenes_activos'] = (int) $stmt->fetchColumn();

    $stmt = $pdo->query('SELECT COUNT(*) AS c FROM especimenes WHERE status = 0');
    $out['especimenes_inactivos'] = (int) $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM solicitud_especimen WHERE estado = 'PENDIENTE'");
    $out['solicitudes_pendientes'] = (int) $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM solicitud_especimen WHERE estado = 'REGRESADA'");
    $out['solicitudes_regresadas'] = (int) $stmt->fetchColumn();

    $stmt = $pdo->query('SELECT COUNT(*) AS c FROM user WHERE status = 1');
    $out['usuarios_activos'] = (int) $stmt->fetchColumn();

    $stmt = $pdo->query('SELECT COUNT(*) AS c FROM fototeca WHERE status = 1');
    $out['fototeca_activas'] = (int) $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) AS c FROM prestamo WHERE status = 1 AND estado_prestamo IN ('Activo','Atrasado','Vencido')");
    $out['prestamos_vigentes'] = (int) $stmt->fetchColumn();

    echo json_encode($out);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
