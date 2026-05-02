class ReporteController {
    constructor() {
        this.apiBase = '../api';
        this._uiAbort = null;
    }

    async init() {
        this.container = document.getElementById('reportes-module');
        if (!this.container) return;

        if (this._uiAbort) this._uiAbort.abort();
        this._uiAbort = new AbortController();
        const { signal } = this._uiAbort;

        document.getElementById('btn-reportes-refresh')?.addEventListener('click', () => this.loadStats(), { signal });
        document.getElementById('btn-export-especimenes-csv')?.addEventListener('click', () => this.exportEspecimenesCsv(), { signal });

        await this.loadStats();
        lucide.createIcons();
    }

    async loadStats() {
        const grid = document.getElementById('reportes-stats-grid');
        if (!grid) return;
        grid.innerHTML = '<div class="d-flex justify-content-center py-5" style="grid-column:1/-1"><div class="spinner-border text-success"></div></div>';
        try {
            const res = await fetch(`${this.apiBase}/reportes.php`);
            if (!res.ok) throw new Error();
            const d = await res.json();
            const cards = [
                ['Espécimenes activos', d.especimenes_activos, 'bug'],
                ['Espécimenes inactivos', d.especimenes_inactivos, 'archive'],
                ['Solicitudes pendientes', d.solicitudes_pendientes, 'clipboard-list'],
                ['Solicitudes regresadas', d.solicitudes_regresadas, 'rotate-ccw'],
                ['Usuarios activos', d.usuarios_activos, 'users'],
                ['Imágenes fototeca (activas)', d.fototeca_activas, 'camera'],
                ['Préstamos vigentes', d.prestamos_vigentes, 'handshake'],
            ];
            grid.innerHTML = cards
                .map(
                    ([title, val, icon]) => `
                <div class="form-card" style="padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-card);">
                    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">
                        <i data-lucide="${icon}" style="width:22px;height:22px;color:var(--accent-color)"></i>
                        <span style="font-size:0.8rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em">${title}</span>
                    </div>
                    <div style="font-size:2rem;font-weight:700;color:var(--text-color);">${Number(val) || 0}</div>
                </div>`
                )
                .join('');
            lucide.createIcons();
        } catch (_) {
            grid.innerHTML =
                '<p style="grid-column:1/-1;text-align:center;color:var(--text-danger,#EF4444)">No se pudieron cargar los reportes.</p>';
        }
    }

    async exportEspecimenesCsv() {
        try {
            const res = await fetch(`${this.apiBase}/especimenes.php`);
            if (!res.ok) throw new Error();
            const rows = await res.json();
            if (!Array.isArray(rows)) throw new Error();
            const active = rows.filter((r) => r.status == 1 || r.status === true);
            const headers = [
                'id_especimen',
                'nombre_comun',
                'nombre_cientifico',
                'fecha_colecta',
                'pais_nombre',
                'estado_nombre',
                'localidad_nombre',
                'colector_nombre',
                'orden_nombre',
                'familia_nombre',
            ];
            const esc = (v) => {
                const s = v == null ? '' : String(v);
                if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
                return s;
            };
            const lines = [headers.join(',')].concat(
                active.map((r) => headers.map((h) => esc(r[h])).join(','))
            );
            const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `especimenes_activos_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
            window.Utils.showToast('CSV generado.', 'success');
        } catch (_) {
            window.Utils.showToast('Error al exportar.', 'danger');
        }
    }
}

window.ReporteController = new ReporteController();
