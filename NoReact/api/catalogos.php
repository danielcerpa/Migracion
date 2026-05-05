<?php
// catalogos.php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$section = $_GET['section'] ?? '';

$valid_sections = [
    'pais', 'estado', 'municipio', 'localidad',
    'orden', 'familia', 'subfamilia', 'tribu', 'genero', 'especie', 'tipo',
    'colector', 'determinador',
    'planta_hospedera', 'organismo_hospedero', 'coleccion', 'cita'
];

if (!in_array($section, $valid_sections)) {
    http_response_code(400);
    echo json_encode(["error" => "Sección de catálogo inválida"]);
    exit;
}

// idKey logic
$idKey = "id" . ucfirst($section);
if ($section === 'organismo_hospedero') $idKey = 'idOrganismo';
if ($section === 'planta_hospedera') $idKey = 'idPlanta';

switch ($method) {
    case 'GET':
        $showAll = isset($_GET['all']) && $_GET['all'] === '1';
        $statusWhere = $showAll ? '' : ' WHERE status = 1';
        $sql = "SELECT * FROM $section" . $statusWhere;
        if ($section === 'estado') {
            $sql = "SELECT e.*, p.nombre AS nombrePais FROM estado e LEFT JOIN pais p ON e.idPais = p.idPais" . ($showAll ? '' : ' WHERE e.status = 1');
        } elseif ($section === 'municipio') {
            $sql = "SELECT m.*, p.nombre AS nombrePais FROM municipio m LEFT JOIN estado e ON m.idEstado = e.idEstado LEFT JOIN pais p ON e.idPais = p.idPais" . ($showAll ? '' : ' WHERE m.status = 1');
        } elseif ($section === 'localidad') {
            $sql = "SELECT l.*, p.nombre AS nombrePais FROM localidad l LEFT JOIN municipio m ON l.idMunicipio = m.idMunicipio LEFT JOIN estado e ON m.idEstado = e.idEstado LEFT JOIN pais p ON e.idPais = p.idPais" . ($showAll ? '' : ' WHERE l.status = 1');
        }
        $stmt = $pdo->query($sql);
        $data = $stmt->fetchAll();
        echo json_encode($data);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Datos inválidos"]);
            exit;
        }

        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');
        
        // Default status to 1 if not provided
        if (!in_array('status', $fields)) {
            $fields[] = 'status';
            $placeholders[] = '?';
            $data['status'] = 1;
        }

        $sql = "INSERT INTO $section (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $pdo->prepare($sql);
        
        try {
            $stmt->execute(array_values($data));
            echo json_encode([$idKey => $pdo->lastInsertId(), "message" => "Registro creado"]);
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
        $id = (int)$_GET['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        
        $setParams = [];
        $values = [];
        foreach ($data as $key => $val) {
            if ($key !== $idKey && !str_starts_with($key, 'nombre')) { // Filter out virtual fields
                $setParams[] = "$key = ?";
                $values[] = $val;
            }
        }
        $values[] = $id;

        $sql = "UPDATE $section SET " . implode(', ', $setParams) . " WHERE $idKey = ?";
        $stmt = $pdo->prepare($sql);
        
        try {
            $stmt->execute($values);
            echo json_encode(["message" => "Registro actualizado"]);
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
        $id = (int)$_GET['id'];
        try {
            $stmt = $pdo->prepare("UPDATE $section SET status = 0 WHERE $idKey = ?");
            $stmt->execute([$id]);
            echo json_encode(["message" => "Registro dado de baja"]);
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
