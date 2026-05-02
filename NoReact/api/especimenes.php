<?php
// especimenes.php
require 'db.php';

/** Columnas permitidas en INSERT/UPDATE (alineado con `especimenes` y flujo de aprobación). */
function especimenes_allowed_columns(): array
{
    return [
        'id_pais', 'id_estado', 'id_municipio', 'id_localidad', 'id_orden', 'id_familia', 'id_subfamilia',
        'id_tribu', 'id_genero', 'id_especie', 'id_tipo', 'id_colector', 'id_determinador', 'id_planta',
        'id_organismo_huesped', 'id_coleccion', 'id_cita',
        'anio_identificacion', 'nombre_comun', 'nombre_cientifico', 'fecha_colecta', 'altitud',
        'datos_ecologicos', 'num_individuos', 'envio_identificacion', 'anio_catalogacion',
        'latitud_n', 'longitud_o', 'numero_frasco', 'status',
    ];
}

function especimenes_filter_payload(array $data, bool $forInsert): array
{
    $allow = array_flip(especimenes_allowed_columns());
    $out = [];
    foreach ($data as $k => $v) {
        if (!isset($allow[$k])) {
            continue;
        }
        $out[$k] = $v;
    }
    if ($forInsert && count($out) === 0) {
        return [];
    }
    return $out;
}

$method = $_SERVER['REQUEST_METHOD'];

$sqlBase = "SELECT e.*,
        c.nombre AS colector_nombre,
        d.nombre AS determinador_nombre,
        esp.nombre AS especie_nombre,
        fam.nombre AS familia_nombre,
        ord.nombre AS orden_nombre,
        sbf.nombre AS subfamilia_nombre,
        tr.nombre AS tribu_nombre,
        gen.nombre AS genero_nombre,
        tp.nombre AS tipo_nombre,
        pai.nombre AS pais_nombre,
        est.nombre AS estado_nombre,
        mun.nombre AS municipio_nombre,
        loc.nombre AS localidad_nombre,
        plt.nombre_cientifico AS planta_nombre,
        plt.nombre_comun AS planta_nombre_comun,
        org.nombre_organismo AS organismo_nombre,
        TRIM(CONCAT(COALESCE(col.acronimo, ''), ' ', COALESCE(col.nombre_institucion, ''))) AS coleccion_nombre,
        cit.titulo AS cita_titulo,
        cit.autores AS cita_autores,
        cit.anio AS cita_anio
        FROM especimenes e
        LEFT JOIN colector c ON e.id_colector = c.idColector
        LEFT JOIN determinador d ON e.id_determinador = d.idDeterminador
        LEFT JOIN especie esp ON e.id_especie = esp.idEspecie
        LEFT JOIN familia fam ON e.id_familia = fam.idFamilia
        LEFT JOIN orden ord ON e.id_orden = ord.idOrden
        LEFT JOIN subfamilia sbf ON e.id_subfamilia = sbf.idSubfamilia
        LEFT JOIN tribu tr ON e.id_tribu = tr.idTribu
        LEFT JOIN genero gen ON e.id_genero = gen.idGenero
        LEFT JOIN tipo tp ON e.id_tipo = tp.idTipo
        LEFT JOIN pais pai ON e.id_pais = pai.idPais
        LEFT JOIN estado est ON e.id_estado = est.idEstado
        LEFT JOIN municipio mun ON e.id_municipio = mun.idMunicipio
        LEFT JOIN localidad loc ON e.id_localidad = loc.idLocalidad
        LEFT JOIN planta_hospedera plt ON e.id_planta = plt.idPlanta
        LEFT JOIN organismo_hospedero org ON e.id_organismo_huesped = org.idOrganismo
        LEFT JOIN coleccion col ON e.id_coleccion = col.idColeccion
        LEFT JOIN cita cit ON e.id_cita = cit.idCita";

switch ($method) {
    case 'GET':
        if (isset($_GET['id']) && $_GET['id'] !== '') {
            $id = (int) $_GET['id'];
            try {
                $sql = $sqlBase . ' WHERE e.id_especimen = ? LIMIT 1';
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$id]);
                $one = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($one ?: null);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => $e->getMessage()]);
            }
            break;
        }

        $sql = $sqlBase . ' WHERE e.status = 1 OR e.status = 0';
        try {
            $stmt = $pdo->query($sql);
            echo json_encode($stmt->fetchAll());
        } catch (PDOException $e) {
            try {
                $stmt = $pdo->query('SELECT * FROM especimenes');
                echo json_encode($stmt->fetchAll());
            } catch (PDOException $ex) {
                echo json_encode([]);
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Datos inválidos']);
            exit;
        }

        foreach ($data as $k => $v) {
            if ($v === '') {
                $data[$k] = null;
            }
        }

        $data = especimenes_filter_payload($data, true);
        if (count($data) === 0) {
            http_response_code(400);
            echo json_encode(['error' => 'No hay campos válidos para crear el espécimen']);
            exit;
        }

        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');

        if (!in_array('status', $fields)) {
            $fields[] = 'status';
            $placeholders[] = '?';
            $data['status'] = 1;
        }

        $sql = 'INSERT INTO especimenes (' . implode(', ', $fields) . ') VALUES (' . implode(', ', $placeholders) . ')';
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute(array_values($data));
            echo json_encode(['id_especimen' => $pdo->lastInsertId(), 'message' => 'Espécimen creado']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Falta el ID']);
            exit;
        }
        $id = (int) $_GET['id'];
        $data = json_decode(file_get_contents('php://input'), true);

        foreach ($data as $k => $v) {
            if ($v === '') {
                $data[$k] = null;
            }
        }

        $data = especimenes_filter_payload($data, false);
        if (count($data) === 0) {
            http_response_code(400);
            echo json_encode(['error' => 'No hay campos válidos para actualizar']);
            exit;
        }

        $setParams = [];
        $values = [];
        foreach ($data as $key => $val) {
            if ($key !== 'id_especimen' && !str_ends_with($key, '_nombre')) {
                $setParams[] = "$key = ?";
                $values[] = $val;
            }
        }
        if (count($setParams) === 0) {
            http_response_code(400);
            echo json_encode(['error' => 'No hay columnas actualizables en el cuerpo de la petición']);
            exit;
        }
        $values[] = $id;

        $sql = 'UPDATE especimenes SET ' . implode(', ', $setParams) . ' WHERE id_especimen = ?';
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute($values);
            echo json_encode(['message' => 'Espécimen actualizado']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Falta el ID']);
            exit;
        }
        $id = (int) $_GET['id'];
        try {
            $stmt = $pdo->prepare('UPDATE especimenes SET status = 0 WHERE id_especimen = ?');
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Espécimen dado de baja']);
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
