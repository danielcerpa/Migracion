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
        if (!empty($_FILES['archivo']['tmp_name']) && is_uploaded_file($_FILES['archivo']['tmp_name'])) {
            $allowed = [
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/webp' => 'webp',
                'image/gif' => 'gif',
            ];
            $mime = null;
            if (function_exists('finfo_open')) {
                $fi = finfo_open(FILEINFO_MIME_TYPE);
                if ($fi) {
                    $mime = finfo_file($fi, $_FILES['archivo']['tmp_name']);
                    finfo_close($fi);
                }
            }
            if ($mime === null && function_exists('mime_content_type')) {
                $mime = @mime_content_type($_FILES['archivo']['tmp_name']);
            }
            if ($mime === null || $mime === false) {
                http_response_code(400);
                echo json_encode(["error" => "No se pudo detectar el tipo del archivo."]);
                exit;
            }
            if (!isset($allowed[$mime])) {
                http_response_code(400);
                echo json_encode(["error" => "Tipo no permitido. Use JPEG, PNG, WebP o GIF."]);
                exit;
            }
            if ($_FILES['archivo']['size'] > 5 * 1024 * 1024) {
                http_response_code(400);
                echo json_encode(["error" => "El archivo supera 5 MB."]);
                exit;
            }

            $baseDir = realpath(__DIR__ . '/..') . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'fototeca';
            if (!is_dir($baseDir)) {
                if (!@mkdir($baseDir, 0755, true)) {
                    http_response_code(500);
                    echo json_encode(["error" => "No se pudo crear la carpeta de subidas (uploads/fototeca)."]);
                    exit;
                }
            }

            $ext = $allowed[$mime];
            $name = 'f_' . bin2hex(random_bytes(8)) . '.' . $ext;
            $destFs = $baseDir . DIRECTORY_SEPARATOR . $name;
            if (!move_uploaded_file($_FILES['archivo']['tmp_name'], $destFs)) {
                http_response_code(500);
                echo json_encode(["error" => "No se pudo guardar el archivo en el servidor."]);
                exit;
            }

            $rutaRel = 'uploads/fototeca/' . $name;
            $idEsp = isset($_POST['id_especimen']) ? (int) $_POST['id_especimen'] : 0;
            if ($idEsp <= 0) {
                @unlink($destFs);
                http_response_code(400);
                echo json_encode(["error" => "id_especimen es obligatorio."]);
                exit;
            }

            $desc = isset($_POST['descripcion_foto']) ? trim((string) $_POST['descripcion_foto']) : '';
            $idCol = (isset($_POST['id_colector']) && $_POST['id_colector'] !== '') ? (int) $_POST['id_colector'] : null;
            $idDet = (isset($_POST['id_determinador']) && $_POST['id_determinador'] !== '') ? (int) $_POST['id_determinador'] : null;

            $sql = "INSERT INTO fototeca (id_colector, id_determinador, id_especimen, ruta_archivo, descripcion_foto, fecha_subida, status) VALUES (?, ?, ?, ?, ?, ?, 1)";
            $stmt = $pdo->prepare($sql);
            try {
                $stmt->execute([$idCol, $idDet, $idEsp, $rutaRel, $desc !== '' ? $desc : null, date('Y-m-d H:i:s')]);
                $idFoto = $pdo->lastInsertId();
                echo json_encode([
                    "id_foto" => (int) $idFoto,
                    "ruta_archivo" => $rutaRel,
                    "message" => "Imagen subida y registrada",
                ]);
            } catch (PDOException $e) {
                @unlink($destFs);
                http_response_code(500);
                echo json_encode(["error" => $e->getMessage()]);
            }
            break;
        }

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

        $sql = "INSERT INTO fototeca (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute(array_values($data));
            echo json_encode(["id_foto" => $pdo->lastInsertId(), "message" => "Imagen registrada"]);
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
