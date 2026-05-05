class EspecimenModel {
    constructor() {
        this.apiBase = '../api';
        this.items = [];
        this.catalogos = {
            pais: [], estado: [], municipio: [], localidad: [],
            orden: [], familia: [], subfamilia: [], tribu: [], genero: [], especie: [], tipo: [],
            colector: [], determinador: [],
            planta_hospedera: [], organismo_hospedero: [], coleccion: [], cita: []
        };
    }

    async fetchCatalogos() {
        const sections = [
            'pais', 'estado', 'municipio', 'localidad',
            'orden', 'familia', 'subfamilia', 'tribu', 'genero', 'especie', 'tipo',
            'colector', 'determinador',
            'planta_hospedera', 'organismo_hospedero', 'coleccion', 'cita'
        ];
        try {
            const results = await Promise.all(sections.map(s =>
                fetch(`${this.apiBase}/catalogos.php?section=${s}`)
                    .then(r => r.ok ? r.json() : [])
                    .catch(() => [])
            ));
            sections.forEach((s, i) => {
                const data = Array.isArray(results[i]) ? results[i] : [];
                this.catalogos[s] = data.filter(item =>
                    item && item.status !== 0 && item.status !== false && item.status !== '0'
                );
            });

            // Función para obtener ID considerando camelCase o snake_case
            const getVal = (obj, keys) => {
                for (const k of keys) { if (obj[k] != null) return String(obj[k]); }
                return null;
            };

            const filterCascade = (child, parent, parentIdKeys, parentRefKeys) => {
                const activeParentIds = new Set(this.catalogos[parent].map(p => getVal(p, parentIdKeys)));
                this.catalogos[child] = this.catalogos[child].filter(c => {
                    const pid = getVal(c, parentRefKeys);
                    return pid == null || activeParentIds.has(pid); // Si no tiene padre referenciado, lo dejamos; si lo tiene, debe estar activo
                });
            };

            // Cascada de Geografía
            filterCascade('estado', 'pais', ['idPais', 'id_pais'], ['idPais', 'id_pais']);
            filterCascade('municipio', 'estado', ['idEstado', 'id_estado'], ['idEstado', 'id_estado']);
            filterCascade('localidad', 'municipio', ['idMunicipio', 'id_municipio'], ['idMunicipio', 'id_municipio']);

            // Cascada de Taxonomía
            filterCascade('familia', 'orden', ['idOrden', 'id_orden'], ['idOrden', 'id_orden']);
            filterCascade('subfamilia', 'familia', ['idFamilia', 'id_familia'], ['idFamilia', 'id_familia']);
            filterCascade('tribu', 'subfamilia', ['idSubfamilia', 'id_subfamilia'], ['idSubfamilia', 'id_subfamilia']);
            filterCascade('genero', 'tribu', ['idTribu', 'id_tribu'], ['idTribu', 'id_tribu']);
            filterCascade('especie', 'genero', ['idGenero', 'id_genero'], ['idGenero', 'id_genero']);

            return this.catalogos;
        } catch (err) {
            console.error('fetchCatalogos error:', err);
            return this.catalogos;
        }
    }

    async fetchEspecimenes() {
        try {
            const response = await fetch(`${this.apiBase}/especimenes.php`);
            if (!response.ok) throw new Error('Error al obtener especímenes');
            this.items = await response.json();
            if (!Array.isArray(this.items)) this.items = [];
            return this.items;
        } catch (err) {
            console.error('fetchEspecimenes error:', err);
            this.items = [];
            return [];
        }
    }

    /** Solicitudes del usuario (flujo de aprobación). */
    async fetchMisSolicitudes(userId) {
        const uid = parseInt(String(userId), 10);
        if (!uid) return [];
        try {
            const r = await fetch(`${this.apiBase}/solicitudes_especimen.php?userId=${encodeURIComponent(uid)}`);
            if (!r.ok) return [];
            const rows = await r.json();
            return Array.isArray(rows) ? rows : [];
        } catch (_) {
            return [];
        }
    }

    /** Envía alta vía `solicitud_especimen` (revisor aprueba en Aprobaciones). */
    async createSolicitud(userId, datosPropuestos) {
        const uid = parseInt(String(userId), 10);
        if (!uid) throw new Error('Usuario inválido');
        const response = await fetch(`${this.apiBase}/solicitudes_especimen.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario: uid, datos_propuestos: datosPropuestos }),
        });
        if (!response.ok) {
            let msg = 'Error al enviar la solicitud';
            try {
                const j = await response.json();
                if (j.error) msg = j.error;
            } catch (_) {}
            throw new Error(msg);
        }
        return await response.json();
    }

    /** Reenvía una solicitud REGRESADA con datos corregidos (cambia estado a PENDIENTE). */
    async updateSolicitud(id, userId, datosPropuestos) {
        const uid = parseInt(String(userId), 10);
        if (!uid) throw new Error('Usuario inválido');
        const response = await fetch(`${this.apiBase}/solicitudes_especimen.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario: uid, datos_propuestos: datosPropuestos }),
        });
        if (!response.ok) {
            let msg = 'Error al reenviar la solicitud';
            try {
                const j = await response.json();
                if (j.error) msg = j.error;
            } catch (_) {}
            throw new Error(msg);
        }
        return await response.json();
    }

    async createEspecimen(data) {
        const response = await fetch(`${this.apiBase}/especimenes.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error creando espécimen');
        return await response.json();
    }

    async updateEspecimen(id, data) {
        const response = await fetch(`${this.apiBase}/especimenes.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Error actualizando espécimen');
        return await response.json();
    }

    async deleteEspecimen(id) {
        const response = await fetch(`${this.apiBase}/especimenes.php?id=${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error eliminando espécimen');
        return await response.json();
    }
}

window.EspecimenModel = new EspecimenModel();
