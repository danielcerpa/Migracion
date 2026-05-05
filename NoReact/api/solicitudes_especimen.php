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
            // Incluir último comentario del revisor (si existe) para solicitudes REGRESADAS
            $sql = 'SELECT s.id_solicitud, s.id_usuario, s.id_especimen, s.estado,
                           s.datos_propuestos, s.fecha_creacion, s.fecha_actualizacion,
                           (SELECT r.comentarios
                            FROM revision_solicitud r
                            WHERE r.id_solicitud = s.id_solicitud
                            ORDER BY r.fecha_revision DESC
                            LIMIT 1) AS ultimo_comentario
                    FROM solicitud_especimen s
                    WHERE s.id_usuario = ?
                    ORDER BY s.fecha_creacion DESC';
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

    case 'PUT':
        // Reenviar una solicitud REGRESADA con datos corregidos
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Falta id de solicitud']);
            exit;
        }

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

        // Verificar que la solicitud pertenece al usuario y está REGRESADA
        try {
            $stmtCheck = $pdo->prepare(
                'SELECT id_solicitud, estado FROM solicitud_especimen WHERE id_solicitud = ? AND id_usuario = ?'
            );
            $stmtCheck->execute([$id, $uid]);
            $sol = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if (!$sol) {
                http_response_code(404);
                echo json_encode(['error' => 'Solicitud no encontrada']);
                exit;
            }

            if ($sol['estado'] !== 'REGRESADA') {
                http_response_code(400);
                echo json_encode(['error' => 'Solo se pueden reenviar solicitudes con estado REGRESADA']);
                exit;
            }

            $raw = $data['datos_propuestos'] ?? null;
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

            $stmtUpd = $pdo->prepare(
                "UPDATE solicitud_especimen SET datos_propuestos = ?, estado = 'PENDIENTE', fecha_actualizacion = NOW() WHERE id_solicitud = ?"
            );
            $stmtUpd->execute([$json, $id]);

            echo json_encode([
                'id_solicitud' => $id,
                'message' => 'Solicitud reenviada correctamente. Un administrador la revisará en Aprobaciones.',
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
