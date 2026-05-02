/**
 * Rellena <select> de catálogos en formularios de espécimenes (api/catalogos.php).
 */
const ESPECIMEN_CATALOG_CONFIG = [
    { section: 'pais', field: 'id_pais', idKey: 'idPais', label: (r) => r.nombre },
    { section: 'estado', field: 'id_estado', idKey: 'idEstado', label: (r) => r.nombre },
    { section: 'municipio', field: 'id_municipio', idKey: 'idMunicipio', label: (r) => r.nombre },
    { section: 'localidad', field: 'id_localidad', idKey: 'idLocalidad', label: (r) => r.nombre },
    { section: 'orden', field: 'id_orden', idKey: 'idOrden', label: (r) => r.nombre },
    { section: 'familia', field: 'id_familia', idKey: 'idFamilia', label: (r) => r.nombre },
    { section: 'subfamilia', field: 'id_subfamilia', idKey: 'idSubfamilia', label: (r) => r.nombre },
    { section: 'tribu', field: 'id_tribu', idKey: 'idTribu', label: (r) => r.nombre },
    { section: 'genero', field: 'id_genero', idKey: 'idGenero', label: (r) => r.nombre },
    { section: 'especie', field: 'id_especie', idKey: 'idEspecie', label: (r) => r.nombre },
    { section: 'tipo', field: 'id_tipo', idKey: 'idTipo', label: (r) => r.nombre },
    { section: 'colector', field: 'id_colector', idKey: 'idColector', label: (r) => r.nombre },
    { section: 'determinador', field: 'id_determinador', idKey: 'idDeterminador', label: (r) => r.nombre },
    {
        section: 'planta_hospedera',
        field: 'id_planta',
        idKey: 'idPlanta',
        label: (r) => r.nombre_cientifico || r.nombre_comun || r.idPlanta,
    },
    { section: 'organismo_hospedero', field: 'id_organismo_huesped', idKey: 'idOrganismo', label: (r) => r.nombre_organismo },
    {
        section: 'coleccion',
        field: 'id_coleccion',
        idKey: 'idColeccion',
        label: (r) => [r.acronimo, r.nombre_institucion].filter(Boolean).join(' — ') || r.idColeccion,
    },
    { section: 'cita', field: 'id_cita', idKey: 'idCita', label: (r) => r.titulo || r.idCita },
];

window.EspecimenCatalogos = {
    async fillFormSelects(form, apiBase = '../api') {
        if (!form) return;
        for (const cfg of ESPECIMEN_CATALOG_CONFIG) {
            const sel = form.querySelector(`select[name="${cfg.field}"]`);
            if (!sel) continue;
            const prev = sel.value;
            try {
                const res = await fetch(`${apiBase}/catalogos.php?section=${encodeURIComponent(cfg.section)}`);
                if (!res.ok) continue;
                const rows = await res.json();
                if (!Array.isArray(rows)) continue;
                sel.replaceChildren();
                const empty = document.createElement('option');
                empty.value = '';
                empty.textContent = '—';
                sel.appendChild(empty);
                for (const r of rows) {
                    const id = r[cfg.idKey];
                    if (id == null) continue;
                    const opt = document.createElement('option');
                    opt.value = String(id);
                    opt.textContent = String(cfg.label(r) ?? id);
                    sel.appendChild(opt);
                }
                if (prev) sel.value = prev;
            } catch (_) {
                /* ignorar catálogo individual caído */
            }
        }
    },
};
