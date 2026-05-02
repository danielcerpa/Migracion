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
