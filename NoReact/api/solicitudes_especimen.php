<?php
// solicitudes_especimen.php — altas vía flujo de aprobación (usuarios sin INSERT directo en especimenes)
require 'db.php';

header('Content-Type: application/json; charset=UTF-8');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $userId = isset($_GET['userId']) ? (int) $_GET['userId'] : 0;
        if ($userId <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Falta userId']);
            exit;
        }
        try {
            $sql = 'SELECT id_solicitud, id_usuario, id_especimen, estado, datos_propuestos, fecha_creacion, fecha_actualizacion
                    FROM solicitud_especimen
                    WHERE id_usuario = ?
                    ORDER BY fecha_creacion DESC';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$userId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as &$row) {
                $row['datos_propuestos'] = json_decode($row['datos_propuestos'], true);
            }
            unset($row);
            echo json_encode($rows);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido']);
            exit;
        }

        $uid = (int) ($data['id_usuario'] ?? 0);
        if ($uid <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'id_usuario es obligatorio']);
            exit;
        }

        $raw = $data['datos_propuestos'] ?? $data['datos'] ?? null;
        if ($raw === null) {
            http_response_code(400);
            echo json_encode(['error' => 'datos_propuestos es obligatorio']);
            exit;
        }

        if (is_array($raw)) {
            unset($raw['id_especimen']);
            $json = json_encode($raw, JSON_UNESCAPED_UNICODE);
        } else {
            $json = (string) $raw;
        }

        if ($json === '' || $json === 'null') {
            http_response_code(400);
            echo json_encode(['error' => 'datos_propuestos vacío']);
            exit;
        }

        try {
            $stmt = $pdo->prepare(
                'INSERT INTO solicitud_especimen (id_usuario, datos_propuestos, estado) VALUES (?, ?, \'PENDIENTE\')'
            );
            $stmt->execute([$uid, $json]);
            echo json_encode([
                'id_solicitud' => (int) $pdo->lastInsertId(),
                'message' => 'Solicitud registrada; un administrador la revisará en Aprobaciones.',
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
