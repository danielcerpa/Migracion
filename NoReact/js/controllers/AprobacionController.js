class AprobacionController {
    constructor() {
        this.model = window.AprobacionModel;
        this.currentSolicitud = null;
        this.commentAction = null; // 'RECHAZADA' o 'REGRESADA'
        this._uiAbort = null;
    }

    async init() {
        this.container = document.getElementById('aprobaciones-module');
        if (!this.container) return;

        await this.model.fetchAprobaciones();

        if (this._uiAbort) this._uiAbort.abort();
        this._uiAbort = new AbortController();
        const { signal } = this._uiAbort;

        this.bindEvents(signal);
        this.render();
        if (window.AprobacionesTutorial) window.AprobacionesTutorial.init();
    }

    bindEvents(signal) {
        document.getElementById('btn-close-modal')?.addEventListener('click', () => this.closeModal(), { signal });
        document.getElementById('btn-confirm-action')?.addEventListener('click', () => this.submitCommentAction(), { signal });
    }

    /** Normaliza `datos_propuestos` y enriquece etiquetas para tarjeta (texto legacy o solo IDs). */
    datosParaTarjeta(sol) {
        const raw = sol.datos_propuestos;
        let d = {};
        if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
            d = raw;
        }
        const idOr = (k) => (d[k] != null && d[k] !== '' ? String(d[k]) : null);
        const lineTax = () => {
            const o = d.orden_nombre || d.orden || (idOr('id_orden') ? `Orden #${idOr('id_orden')}` : null);
            const f = d.familia_nombre || d.familia || (idOr('id_familia') ? `Fam. #${idOr('id_familia')}` : null);
            if (o && f) return `${o} / ${f}`;
            return o || f || 'N/A';
        };
        const loc = () => {
            const l = d.localidad_nombre || d.localidad || (idOr('id_localidad') ? `Loc. #${idOr('id_localidad')}` : null);
            const m = d.municipio_nombre || d.municipio || (idOr('id_municipio') ? `Mun. #${idOr('id_municipio')}` : null);
            if (l && m) return `${l}, ${m}`;
            return l || m || 'N/A';
        };
        const col = d.coleccion_nombre || d.coleccion || (idOr('id_coleccion') ? `Col. #${idOr('id_coleccion')}` : 'N/A');
        return { d, nombre_cientifico: d.nombre_cientifico || 'N/A', nombre_comun: d.nombre_comun || 'N/A', lineTax: lineTax(), loc: loc(), coleccion: col };
    }

    render() {
        const grid = document.getElementById('aprobaciones-grid-container');
        if (!grid) return;

        if (this.model.items.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="inbox" class="empty-icon" style="width: 48px; height: 48px;"></i>
                    <h3>No hay solicitudes pendientes</h3>
                    <p>Todas las peticiones han sido procesadas.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        grid.innerHTML = '<div class="aprobaciones-grid"></div>';
        const gridContainer = grid.querySelector('.aprobaciones-grid');

        this.model.items.forEach(sol => {
            const t = this.datosParaTarjeta(sol);
            const card = document.createElement('div');
            card.className = 'aprobacion-card';
            
            const initial = sol.usuario_nombre ? sol.usuario_nombre.charAt(0) : 'U';
            const dateStr = sol.fecha_creacion ? sol.fecha_creacion.split(' ')[0] : 'N/A';

            card.innerHTML = `
                <div class="card-header">
                    <div class="user-info">
                        <div class="user-avatar">${initial}</div>
                        <div>
                            <div class="user-name">${sol.usuario_nombre} ${sol.usuario_apellido}</div>
                            <div class="request-date">
                                <i data-lucide="calendar" style="width: 12px; height: 12px; margin-right: 4px;"></i>
                                ${dateStr}
                            </div>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="info-label">ID Solicitud</span>
                        <span class="info-value"><i data-lucide="hash" style="width: 12px; height: 12px;"></i> ${sol.id_solicitud}</span>
                    </div>
                </div>

                <div class="insect-info-grid">
                    <div class="info-item">
                        <span class="info-label"><i data-lucide="leaf" style="width: 12px; height: 12px;"></i> Nombre Científico</span>
                        <span class="info-value scientific">${t.nombre_cientifico}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Nombre Común</span>
                        <span class="info-value">${t.nombre_comun}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Orden / Familia</span>
                        <span class="info-value">${t.lineTax}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label"><i data-lucide="map-pin" style="width: 12px; height: 12px;"></i> Ubicación</span>
                        <span class="info-value">${t.loc}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fecha Colecta</span>
                        <span class="info-value">${t.d.fecha_colecta || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label"><i data-lucide="library" style="width: 12px; height: 12px;"></i> Colección</span>
                        <span class="info-value">${t.coleccion}</span>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="btn-aprobacion btn-accept" data-id="${sol.id_solicitud}">
                        <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i> Aceptar
                    </button>
                    <button class="btn-aprobacion btn-return" data-id="${sol.id_solicitud}">
                        <i data-lucide="rotate-ccw" style="width: 18px; height: 18px;"></i> Regresar
                    </button>
                    <button class="btn-aprobacion btn-reject" data-id="${sol.id_solicitud}">
                        <i data-lucide="x-circle" style="width: 18px; height: 18px;"></i> Rechazar
                    </button>
                </div>
            `;

            const btnAccept = card.querySelector('.btn-accept');
            const btnReturn = card.querySelector('.btn-return');
            const btnReject = card.querySelector('.btn-reject');

            btnAccept.addEventListener('click', () => this.handleApprove(sol.id_solicitud));
            btnReturn.addEventListener('click', () => this.openModal(sol.id_solicitud, 'REGRESADA'));
            btnReject.addEventListener('click', () => this.openModal(sol.id_solicitud, 'RECHAZADA'));

            gridContainer.appendChild(card);
        });

        this.applyPermissions();
        lucide.createIcons();
    }

    applyPermissions() {
        const canEdit = window.Utils.checkPermission('Aprobaciones', 'edit');
        const canDelete = window.Utils.checkPermission('Aprobaciones', 'delete');

        // Los botones de aceptar/regresar/rechazar se consideran edición/gestión
        document.querySelectorAll('.btn-accept, .btn-return').forEach(btn => {
            btn.style.display = canEdit ? 'flex' : 'none';
        });

        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.style.display = canDelete ? 'flex' : 'none';
        });
    }

    async handleApprove(id) {
        if (!confirm('¿Está seguro de que desea aprobar esta solicitud? Se creará un nuevo espécimen en el catálogo.')) return;
        try {
            await this.model.approve(id);
            window.Utils.showToast('Solicitud aprobada y espécimen creado.', 'success');
            this.render();
        } catch (err) {
            window.Utils.showToast('No se pudo aprobar: ' + (err.message || 'error de servidor'), 'danger');
        }
    }

    openModal(id, action) {
        this.currentSolicitud = id;
        this.commentAction = action;
        
        const modal = document.getElementById('aprobacion-modal');
        const title = document.getElementById('modal-action-title');
        const subtitle = document.getElementById('modal-action-subtitle');
        const text = document.getElementById('modal-comment-text');
        
        title.textContent = action === 'RECHAZADA' ? 'Rechazar Solicitud' : 'Regresar Solicitud';
        subtitle.textContent = action === 'RECHAZADA' 
            ? 'Explique brevemente por qué se rechaza este registro.' 
            : 'Indique los cambios o correcciones que el usuario debe realizar.';
        text.value = '';
        
        const btnConfirm = document.getElementById('btn-confirm-action');
        btnConfirm.className = `btn-aprobacion ${action === 'RECHAZADA' ? 'btn-reject' : 'btn-return'}`;
        
        modal.style.display = 'flex';
    }

    closeModal() {
        document.getElementById('aprobacion-modal').style.display = 'none';
        this.currentSolicitud = null;
        this.commentAction = null;
    }

    async submitCommentAction() {
        const text = document.getElementById('modal-comment-text').value;
        if (this.commentAction === 'REGRESADA' && text.trim() === '') {
            alert('Debe agregar un comentario para regresar la solicitud.');
            return;
        }

        try {
            if (this.commentAction === 'RECHAZADA') {
                await this.model.reject(this.currentSolicitud, text);
                window.Utils.showToast('Solicitud rechazada.', 'success');
            } else {
                await this.model.returnRequest(this.currentSolicitud, text);
                window.Utils.showToast('Solicitud regresada al usuario.', 'success');
            }
        } catch (err) {
            window.Utils.showToast('No se pudo completar la acción.', 'danger');
            return;
        }

        this.closeModal();
        this.render();
    }
}

window.AprobacionController = new AprobacionController();
