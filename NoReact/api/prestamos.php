<?php
// prestamos.php
require 'db.php';

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
            echo json_encode($stmt->fetchAll());
        } catch (PDOException $e) {
            try {
                $stmt = $pdo->query("SELECT * FROM prestamo");
                echo json_encode($stmt->fetchAll());
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

        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');
        
        if (!in_array('status', $fields)) {
            $fields[] = 'status';
            $placeholders[] = '?';
            $data['status'] = 1;
        }
        
        if (!in_array('estado_prestamo', $fields)) {
            $fields[] = 'estado_prestamo';
            $placeholders[] = '?';
            $data['estado_prestamo'] = 'Activo';
        }

        $sql = "INSERT INTO prestamo (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $pdo->prepare($sql);
        
        try {
            $stmt->execute(array_values($data));
            echo json_encode(["idprestamo" => $pdo->lastInsertId(), "message" => "Préstamo registrado"]);
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
            if ($key !== 'idprestamo' && !str_ends_with($key, '_nombre')) {
                $setParams[] = "$key = ?";
                $values[] = $val;
            }
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
        $id = (int)$_GET['id'];
        try {
            $stmt = $pdo->prepare("UPDATE prestamo SET status = 0, estado_prestamo = 'Finalizado' WHERE idprestamo = ?");
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
?>
