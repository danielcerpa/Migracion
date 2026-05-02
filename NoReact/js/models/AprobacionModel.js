class AprobacionModel {
    constructor() {
        this.apiBase = '../api';
        this.items = [];
    }

    async fetchAprobaciones() {
        try {
            const response = await fetch(`${this.apiBase}/aprobaciones.php`);
            if (!response.ok) throw new Error('Error al obtener aprobaciones');
            this.items = await response.json();
            return this.items;
        } catch (err) {
            console.error('fetchAprobaciones error:', err);
            this.items = [];
            return [];
        }
    }

    async approve(id) {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`${this.apiBase}/aprobaciones.php?action=approve&id=${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_revisor: user?.id || 1 })
            });
            const body = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(body.error || 'Error al aprobar');
            }
            await this.fetchAprobaciones();
            return true;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async reject(id, comentario) {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`${this.apiBase}/aprobaciones.php?action=reject&id=${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_revisor: user?.id || 1,
                    comentarios: comentario
                })
            });
            if (!response.ok) throw new Error('Error al rechazar');
            await this.fetchAprobaciones();
            return true;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async returnRequest(id, comentario) {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`${this.apiBase}/aprobaciones.php?action=return&id=${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_revisor: user?.id || 1,
                    comentarios: comentario
                })
            });
            if (!response.ok) throw new Error('Error al regresar');
            await this.fetchAprobaciones();
            return true;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

window.AprobacionModel = new AprobacionModel();
