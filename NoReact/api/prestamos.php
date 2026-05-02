<?php
// prestamos.php — alineado con v2.sql (id_especimen, institucion_prestatario, prestamista, etc.)
require 'db.php';

/**
 * Completa nombres científico/común desde el espécimen si faltan.
 */
function prestamo_fill_nombres(PDO $pdo, int $idEsp, array &$row): void
{
    if ($idEsp <= 0) {
        return;
    }
    $nc = trim($row['nombre_cientifico'] ?? '');
    $ncom = trim($row['nombre_comun'] ?? '');
    if ($nc !== '' && $ncom !== '') {
        return;
    }
    $st = $pdo->prepare("SELECT nombre_cientifico, nombre_comun FROM especimenes WHERE id_especimen = ?");
    $st->execute([$idEsp]);
    $e = $st->fetch(PDO::FETCH_ASSOC);
    if (!$e) {
        return;
    }
    if ($nc === '') {
        $row['nombre_cientifico'] = $e['nombre_cientifico'] ?? 'Sin determinar';
    }
    if ($ncom === '') {
        $row['nombre_comun'] = $e['nombre_comun'] ?? 'Sin determinar';
    }
}

function prestamo_empty_date($v)
{
    if ($v === null || $v === '') {
        return null;
    }
    return $v;
}

/**
 * Convierte payload del frontend (nombres del sistema React antiguo) a columnas reales de `prestamo`.
 */
function prestamo_normalize_for_db(PDO $pdo, array $in): array
{
    $idEsp = 0;
    if (!empty($in['id_especimen'])) {
        $idEsp = (int) $in['id_especimen'];
    } elseif (!empty($in['idEjemplar'])) {
        $idEsp = (int) $in['idEjemplar'];
    }

    $row = [
        'id_especimen' => $idEsp,
        'nombre_cientifico' => trim($in['nombre_cientifico'] ?? ''),
        'nombre_comun' => trim($in['nombre_comun'] ?? ''),
        'prestatario' => trim($in['prestatario'] ?? ''),
        'telefono_prestatario' => trim($in['telefono_prestatario'] ?? '') ?: null,
        'correo_prestatario' => trim($in['correo_prestatario'] ?? '') ?: null,
        'institucion_prestatario' => trim($in['institucion_prestatario'] ?? $in['institucion'] ?? '') ?: null,
        'prestamista' => trim($in['prestamista'] ?? '') ?: 'Colección',
        'telefono_prestamista' => trim($in['telefono_prestamista'] ?? '') ?: null,
        'correo_prestamista' => trim($in['correo_prestamista'] ?? '') ?: null,
        'institucion_origen' => trim($in['institucion_origen'] ?? '') ?: null,
        'fecha_prestamo' => prestamo_empty_date($in['fecha_prestamo'] ?? null),
        'fecha_devolucion_estimada' => prestamo_empty_date($in['fecha_devolucion_estimada'] ?? null),
        'fecha_devolucion_real' => prestamo_empty_date($in['fecha_devolucion_real'] ?? null),
        'estado_prestamo' => trim($in['estado_prestamo'] ?? '') ?: 'Activo',
        'proposito' => trim($in['proposito'] ?? '') ?: null,
        'condicion_al_prestar' => trim($in['condicion_al_prestar'] ?? '') ?: null,
        'observaciones' => trim($in['observaciones'] ?? '') ?: null,
    ];

    prestamo_fill_nombres($pdo, $idEsp, $row);

    if ($row['nombre_cientifico'] === '') {
        $row['nombre_cientifico'] = 'Sin determinar';
    }
    if ($row['nombre_comun'] === '') {
        $row['nombre_comun'] = 'Sin determinar';
    }
    if ($row['prestatario'] === '') {
        $row['prestatario'] = 'Sin nombre';
    }

    return $row;
}

function prestamo_map_response(array $r): array
{
    $r['idPrestamo'] = (int) ($r['idprestamo'] ?? 0);
    $r['idEjemplar'] = (int) ($r['id_especimen'] ?? 0);
    if (isset($r['institucion_prestatario'])) {
        $r['institucion'] = $r['institucion_prestatario'];
    }
    return $r;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT p.*,
                esp.nombre_cientifico as especie_nombre
                FROM prestamo p
                LEFT JOIN especimenes esp ON p.id_especimen = esp.id_especimen
                WHERE p.status = 1 OR p.status = 0";
        try {
            $stmt = $pdo->query($sql);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as &$r) {
                $r = prestamo_map_response($r);
            }
            unset($r);
            echo json_encode($rows);
        } catch (PDOException $e) {
            try {
                $stmt = $pdo->query("SELECT * FROM prestamo");
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                foreach ($rows as &$r) {
                    $r = prestamo_map_response($r);
                }
                unset($r);
                echo json_encode($rows);
            } catch (PDOException $ex) {
                echo json_encode([]);
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Datos inválidos"]);
            exit;
        }

        $norm = prestamo_normalize_for_db($pdo, $data);
        if ($norm['id_especimen'] <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "id_especimen / idEjemplar es obligatorio"]);
            exit;
        }
        if (empty($norm['fecha_prestamo'])) {
            http_response_code(400);
            echo json_encode(["error" => "fecha_prestamo es obligatoria"]);
            exit;
        }

        $norm['status'] = 1;

        $fields = array_keys($norm);
        $placeholders = array_fill(0, count($fields), '?');
        $sql = "INSERT INTO prestamo (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute(array_values($norm));
            $newId = (int) $pdo->lastInsertId();
            echo json_encode(["idprestamo" => $newId, "idPrestamo" => $newId, "message" => "Préstamo registrado"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el ID"]);
            exit;
        }
        $id = (int) $_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Datos inválidos"]);
            exit;
        }

        $norm = prestamo_normalize_for_db($pdo, $data);
        unset($norm['status']);

        $setParams = [];
        $values = [];
        foreach ($norm as $key => $val) {
            $setParams[] = "$key = ?";
            $values[] = $val;
        }
        $values[] = $id;

        $sql = "UPDATE prestamo SET " . implode(', ', $setParams) . " WHERE idprestamo = ?";
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute($values);
            echo json_encode(["message" => "Préstamo actualizado"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Falta el ID"]);
            exit;
        }
        $id = (int) $_GET['id'];
        try {
            $stmt = $pdo->prepare("UPDATE prestamo SET status = 0, estado_prestamo = 'Baja' WHERE idprestamo = ?");
            $stmt->execute([$id]);
            echo json_encode(["message" => "Préstamo dado de baja"]);
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
