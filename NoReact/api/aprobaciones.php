<?php
// aprobaciones.php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Obtener solicitudes pendientes junto con el nombre del usuario
        $sql = "
            SELECT s.*, u.name as usuario_nombre, u.last_name as usuario_apellido
            FROM solicitud_especimen s
            JOIN user u ON s.id_usuario = u.idUser
            WHERE s.estado = 'PENDIENTE'
            ORDER BY s.fecha_creacion DESC
        ";
        try {
            $stmt = $pdo->query($sql);
            $results = $stmt->fetchAll();
            // Decodificar el JSON de datos_propuestos para el frontend
            foreach ($results as &$row) {
                $row['datos_propuestos'] = json_decode($row['datos_propuestos'], true);
            }
            echo json_encode($results);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        // Acciones: APROBAR, RECHAZAR, REGRESAR
        $action = $_GET['action'] ?? '';
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el ID de la solicitud"]);
            exit;
        }

        try {
            $pdo->beginTransaction();

            // Obtener la solicitud actual
            $stmt = $pdo->prepare("SELECT * FROM solicitud_especimen WHERE id_solicitud = ?");
            $stmt->execute([$id]);
            $solicitud = $stmt->fetch();

            if (!$solicitud) {
                throw new Exception("Solicitud no encontrada");
            }

            $datos = json_decode($solicitud['datos_propuestos'], true);
            if (!is_array($datos)) {
                $datos = [];
            }

            // Solo columnas válidas de `especimenes` (evita fallos por claves de UI o JSON antiguo)
            $allowedCols = [
                'id_pais', 'id_estado', 'id_municipio', 'id_localidad', 'id_orden', 'id_familia', 'id_subfamilia',
                'id_tribu', 'id_genero', 'id_especie', 'id_tipo', 'id_colector', 'id_determinador', 'id_planta',
                'id_organismo_huesped', 'id_coleccion', 'id_cita',
                'anio_identificacion', 'nombre_comun', 'nombre_cientifico', 'fecha_colecta', 'altitud',
                'datos_ecologicos', 'num_individuos', 'envio_identificacion', 'anio_catalogacion',
                'latitud_n', 'longitud_o', 'numero_frasco', 'status',
            ];
            $filtered = [];
            foreach ($allowedCols as $c) {
                if (array_key_exists($c, $datos)) {
                    $filtered[$c] = $datos[$c];
                }
            }
            if (!array_key_exists('status', $filtered)) {
                $filtered['status'] = 1;
            }

            if ($action === 'approve') {
                // 1. Crear el espécimen en la tabla principal
                $fields = array_keys($filtered);
                if (count($fields) === 0) {
                    throw new Exception("La solicitud no contiene datos de espécimen válidos para aprobar.");
                }
                $placeholders = array_fill(0, count($fields), '?');
                $sqlEsp = "INSERT INTO especimenes (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
                $stmtEsp = $pdo->prepare($sqlEsp);
                $stmtEsp->execute(array_values($filtered));
                $idEspecimen = $pdo->lastInsertId();

                // 2. Actualizar estado de la solicitud
                $stmtUpd = $pdo->prepare("UPDATE solicitud_especimen SET estado = 'APROBADA', id_especimen = ? WHERE id_solicitud = ?");
                $stmtUpd->execute([$idEspecimen, $id]);

                // 3. Registrar revisión
                $stmtRev = $pdo->prepare("INSERT INTO revision_solicitud (id_solicitud, id_revisor, accion) VALUES (?, ?, 'APROBADA')");
                $stmtRev->execute([$id, $data['id_revisor'] ?? 1]); // ID 1 como fallback (admin)

                $message = "Solicitud aprobada y espécimen creado";

            } else if ($action === 'reject' || $action === 'return') {
                $nuevoEstado = ($action === 'reject') ? 'RECHAZADA' : 'REGRESADA';
                
                // 1. Actualizar estado
                $stmtUpd = $pdo->prepare("UPDATE solicitud_especimen SET estado = ? WHERE id_solicitud = ?");
                $stmtUpd->execute([$nuevoEstado, $id]);

                // 2. Registrar revisión con comentarios
                $stmtRev = $pdo->prepare("INSERT INTO revision_solicitud (id_solicitud, id_revisor, accion, comentarios) VALUES (?, ?, ?, ?)");
                $stmtRev->execute([
                    $id, 
                    $data['id_revisor'] ?? 1, 
                    $nuevoEstado, 
                    $data['comentarios'] ?? ''
                ]);

                $message = "Solicitud " . strtolower($nuevoEstado);
            } else {
                throw new Exception("Acción no válida");
            }

            $pdo->commit();
            echo json_encode(["success" => true, "message" => $message]);

        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
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
