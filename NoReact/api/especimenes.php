<?php
// especimenes.php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT e.*, 
                c.nombre as colector_nombre,
                d.nombre as determinador_nombre,
                esp.nombre as especie_nombre,
                fam.nombre as familia_nombre
                FROM especimenes e
                LEFT JOIN colector c ON e.id_colector = c.idColector
                LEFT JOIN determinador d ON e.id_determinador = d.idDeterminador
                LEFT JOIN especie esp ON e.id_especie = esp.idEspecie
                LEFT JOIN familia fam ON e.id_familia = fam.idFamilia
                WHERE e.status = 1 OR e.status = 0";
        try {
            $stmt = $pdo->query($sql);
            echo json_encode($stmt->fetchAll());
        } catch (PDOException $e) {
            // Fallback
            try {
                $stmt = $pdo->query("SELECT * FROM especimenes");
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

        $sql = "INSERT INTO especimenes (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $pdo->prepare($sql);
        
        try {
            $stmt->execute(array_values($data));
            echo json_encode(["id_especimen" => $pdo->lastInsertId(), "message" => "Espécimen creado"]);
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
            if ($key !== 'id_especimen' && !str_ends_with($key, '_nombre')) {
                $setParams[] = "$key = ?";
                $values[] = $val;
            }
        }
        $values[] = $id;

        $sql = "UPDATE especimenes SET " . implode(', ', $setParams) . " WHERE id_especimen = ?";
        $stmt = $pdo->prepare($sql);
        
        try {
            $stmt->execute($values);
            echo json_encode(["message" => "Espécimen actualizado"]);
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
            $stmt = $pdo->prepare("UPDATE especimenes SET status = 0 WHERE id_especimen = ?");
            $stmt->execute([$id]);
            echo json_encode(["message" => "Espécimen dado de baja"]);
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
