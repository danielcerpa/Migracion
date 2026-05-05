<?php
// fototeca.php — JSON CRUD + subida multipart (archivos en uploads/fototeca/)
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT * FROM fototeca WHERE status = 1 OR status = 0";
        try {
            $stmt = $pdo->query($sql);
            echo json_encode($stmt->fetchAll());
        } catch (PDOException $e) {
            echo json_encode([]);
        }
        break;

    case 'POST':

        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Datos inválidos"]);
            exit;
        }

        if (isset($data['id_colector']) && $data['id_colector'] === '') {
            $data['id_colector'] = null;
        }
        if (isset($data['id_determinador']) && $data['id_determinador'] === '') {
            $data['id_determinador'] = null;
        }

        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');

        if (!in_array('status', $fields)) {
            $fields[] = 'status';
            $placeholders[] = '?';
            $data['status'] = 1;
        }

        if (!in_array('fecha_subida', $fields)) {
            $fields[] = 'fecha_subida';
            $placeholders[] = '?';
            $data['fecha_subida'] = date('Y-m-d H:i:s');
        }

        if (empty($data['ruta_archivo']) || empty($data['id_especimen'])) {
            http_response_code(400);
            echo json_encode(["error" => "Faltan campos obligatorios (id_especimen, archivo o ruta)"]);
            exit;
        }

        if (!isset($data['status'])) $data['status'] = 1;
        if (!isset($data['fecha_subida'])) $data['fecha_subida'] = date('Y-m-d H:i:s');

        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');
        $sql = "INSERT INTO fototeca (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute(array_values($data));
            echo json_encode(["id_foto" => $pdo->lastInsertId(), "ruta_archivo" => $data['ruta_archivo'], "message" => "Imagen registrada"]);
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

        $setParams = [];
        $values = [];
        foreach ($data as $key => $val) {
            if ($key !== 'id_foto') {
                if (($key === 'id_colector' || $key === 'id_determinador') && $val === '') {
                    $val = null;
                }
                $setParams[] = "$key = ?";
                $values[] = $val;
            }
        }
        $values[] = $id;

        $sql = "UPDATE fototeca SET " . implode(', ', $setParams) . " WHERE id_foto = ?";
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute($values);
            echo json_encode(["message" => "Imagen actualizada"]);
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
            $stmt = $pdo->prepare("UPDATE fototeca SET status = 0 WHERE id_foto = ?");
            $stmt->execute([$id]);
            echo json_encode(["message" => "Imagen eliminada"]);
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
