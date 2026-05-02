class AprobacionController {
    constructor() {
        this.model = window.AprobacionModel;
        this.currentSolicitud = null;
        this.commentAction = null; // 'RECHAZADA' o 'REGRESADA'
    }

    async init() {
        this.container = document.getElementById('aprobaciones-module');
        if (!this.container) return;

        await this.model.fetchAprobaciones();
        
        this.bindEvents();
        this.render();
        if (window.AprobacionesTutorial) window.AprobacionesTutorial.init();
    }

    bindEvents() {
        document.getElementById('btn-close-modal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-confirm-action')?.addEventListener('click', () => this.submitCommentAction());
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
            const d = sol.datos_propuestos;
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
                        <span class="info-value scientific">${d.nombre_cientifico || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Nombre Común</span>
                        <span class="info-value">${d.nombre_comun || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Orden / Familia</span>
                        <span class="info-value">${d.orden || 'N/A'} / ${d.familia || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label"><i data-lucide="map-pin" style="width: 12px; height: 12px;"></i> Ubicación</span>
                        <span class="info-value">${d.localidad || 'N/A'}, ${d.municipio || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fecha Colecta</span>
                        <span class="info-value">${d.fecha_colecta || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label"><i data-lucide="library" style="width: 12px; height: 12px;"></i> Colección</span>
                        <span class="info-value">${d.coleccion || 'N/A'}</span>
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
        await this.model.approve(id);
        this.render();
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

        if (this.commentAction === 'RECHAZADA') {
            await this.model.reject(this.currentSolicitud, text);
        } else {
            await this.model.returnRequest(this.currentSolicitud, text);
        }

        this.closeModal();
        this.render();
    }
}

window.AprobacionController = new AprobacionController();
