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
                    <button class="btn-aprobacion btn-ficha" data-id="${sol.id_solicitud}" title="Ver ficha técnica completa" style="background:rgba(99,102,241,0.1);color:#6366f1;border:1px solid rgba(99,102,241,0.25);">
                        <i data-lucide="file-text" style="width: 16px; height: 16px;"></i> Ver Ficha
                    </button>
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

            const btnFicha = card.querySelector('.btn-ficha');
            const btnAccept = card.querySelector('.btn-accept');
            const btnReturn = card.querySelector('.btn-return');
            const btnReject = card.querySelector('.btn-reject');

            btnFicha.addEventListener('click', () => this.openFichaModal(sol));
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

    openFichaModal(sol) {
        const d = sol.datos_propuestos || {};
        const val = (v) => (v === null || v === undefined || v === '') ? '—' : v;
        const field = (label, value) =>
            `<div class="ft-field"><span class="ft-label">${label}</span><span class="ft-value">${val(value)}</span></div>`;

        const revisiones = sol.num_revisiones > 0
            ? `<span style="background:rgba(251,191,36,0.15);color:#f59e0b;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;margin-left:8px;">${sol.num_revisiones} revisión(es) previa(s)</span>`
            : '';

        const comentarioRevisor = sol.ultimo_comentario_revisor
            ? `<div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:8px;padding:0.75rem 1rem;margin-bottom:1rem;">
                <strong style="color:#f59e0b;font-size:0.85rem;">Último comentario del revisor:</strong>
                <p style="margin:0.25rem 0 0;font-size:0.88rem;color:var(--text-color);">${sol.ultimo_comentario_revisor}</p>
               </div>` : '';

        const html = `
        <div style="font-family:inherit;max-height:80vh;overflow-y:auto;">
          ${comentarioRevisor}
          <div class="ft-modal" style="position:relative;max-width:none;width:100%;box-shadow:none;padding:0;">
            <header class="ft-header">
              <h1 class="ft-title" style="display:flex;align-items:center;gap:0;">FICHA TÉCNICA ${revisiones}</h1>
              <p class="ft-subtitle">Solicitud #${sol.id_solicitud} · ${sol.usuario_nombre} ${sol.usuario_apellido}</p>
            </header>
            <section class="ft-section ft-hero-section" style="margin-top:0;">
              <div class="ft-hero-info">
                <h2 class="ft-common-name">${val(d.nombre_comun)}</h2>
                <p class="ft-scientific-name"><i>${val(d.nombre_cientifico)}</i></p>
              </div>
              <div class="ft-hero-image"><i data-lucide="bug" style="width:48px;height:48px;opacity:0.4;"></i></div>
            </section>
            <section class="ft-section">
              <h3 class="ft-section-title">Datos Generales</h3>
              <div class="ft-grid ft-grid-3">
                ${field('Núm. Individuos', d.num_individuos)}
                ${field('Fecha de Colecta', d.fecha_colecta)}
                ${field('Año Identificación', d.anio_identificacion)}
                ${field('Año Catalogación', d.anio_catalogacion)}
                ${field('Número de Frasco', d.numero_frasco)}
                ${field('Envío Identificación', d.envio_identificacion)}
              </div>
            </section>
            <section class="ft-section">
              <h3 class="ft-section-title">Taxonomía</h3>
              <div class="ft-grid ft-grid-3">
                ${field('Orden', d.orden_nombre || d.orden || (d.id_orden ? '#'+d.id_orden : null))}
                ${field('Familia', d.familia_nombre || d.familia || (d.id_familia ? '#'+d.id_familia : null))}
                ${field('Subfamilia', d.id_subfamilia ? '#'+d.id_subfamilia : null)}
                ${field('Tribu', d.id_tribu ? '#'+d.id_tribu : null)}
                ${field('Género', d.id_genero ? '#'+d.id_genero : null)}
                ${field('Especie', d.id_especie ? '#'+d.id_especie : null)}
              </div>
            </section>
            <section class="ft-section">
              <h3 class="ft-section-title">Ubicación Geográfica</h3>
              <div class="ft-grid ft-grid-3">
                ${field('Localidad', d.localidad_nombre || d.localidad || (d.id_localidad ? '#'+d.id_localidad : null))}
                ${field('Municipio', d.municipio_nombre || d.municipio || (d.id_municipio ? '#'+d.id_municipio : null))}
                ${field('Latitud', d.latitud_n)}
                ${field('Longitud', d.longitud_o)}
                ${field('Altitud (msnm)', d.altitud)}
              </div>
            </section>
            <section class="ft-section">
              <h3 class="ft-section-title">Catalogación</h3>
              <div class="ft-grid ft-grid-2">
                ${field('Colección', d.coleccion_nombre || d.coleccion || (d.id_coleccion ? '#'+d.id_coleccion : null))}
                ${field('Colector', d.id_colector ? '#'+d.id_colector : null)}
                ${field('Determinador', d.id_determinador ? '#'+d.id_determinador : null)}
                ${field('Cita Bibliográfica', d.id_cita ? '#'+d.id_cita : null)}
              </div>
            </section>
            <section class="ft-section">
              <h3 class="ft-section-title">Datos Ecológicos</h3>
              <div class="ft-notes">${d.datos_ecologicos || 'Sin datos ecológicos registrados.'}</div>
            </section>
          </div>
        </div>`;

        // Crear / reusar modal de ficha
        let fichaModal = document.getElementById('aprobacion-ficha-modal');
        if (!fichaModal) {
            fichaModal = document.createElement('div');
            fichaModal.id = 'aprobacion-ficha-modal';
            fichaModal.className = 'modal-overlay';
            fichaModal.style.cssText = 'display:none;align-items:flex-start;padding-top:4vh;';
            fichaModal.innerHTML = `
                <div class="modal-content" style="max-width:800px;width:95%;max-height:90vh;overflow-y:auto;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                        <h2 class="modal-title" id="ficha-modal-title">Ficha Técnica</h2>
                        <button id="btn-close-ficha-modal" style="background:none;border:none;cursor:pointer;font-size:1.5rem;color:var(--text-muted);">×</button>
                    </div>
                    <div id="ficha-modal-body"></div>
                    <div class="modal-footer" style="border-top:1px solid var(--border-color);margin-top:1rem;padding-top:1rem;">
                        <button id="btn-ficha-approve" class="btn-aprobacion btn-accept" data-id=""><i data-lucide="check-circle" style="width:16px;height:16px;"></i> Aceptar</button>
                        <button id="btn-ficha-return" class="btn-aprobacion btn-return" data-id=""><i data-lucide="rotate-ccw" style="width:16px;height:16px;"></i> Regresar</button>
                        <button id="btn-ficha-reject" class="btn-aprobacion btn-reject" data-id=""><i data-lucide="x-circle" style="width:16px;height:16px;"></i> Rechazar</button>
                    </div>
                </div>`;
            document.getElementById('aprobaciones-module').appendChild(fichaModal);
            document.getElementById('btn-close-ficha-modal').addEventListener('click', () => { fichaModal.style.display = 'none'; });
            fichaModal.addEventListener('click', (e) => { if (e.target === fichaModal) fichaModal.style.display = 'none'; });
        }

        document.getElementById('ficha-modal-body').innerHTML = html;
        const btnApprove = document.getElementById('btn-ficha-approve');
        const btnReturn = document.getElementById('btn-ficha-return');
        const btnReject = document.getElementById('btn-ficha-reject');
        // Re-assign listeners by cloning
        [btnApprove, btnReturn, btnReject].forEach(b => { const c = b.cloneNode(true); b.parentNode.replaceChild(c, b); });
        document.getElementById('btn-ficha-approve').addEventListener('click', () => { fichaModal.style.display='none'; this.handleApprove(sol.id_solicitud); });
        document.getElementById('btn-ficha-return').addEventListener('click', () => { fichaModal.style.display='none'; this.openModal(sol.id_solicitud, 'REGRESADA'); });
        document.getElementById('btn-ficha-reject').addEventListener('click', () => { fichaModal.style.display='none'; this.openModal(sol.id_solicitud, 'RECHAZADA'); });

        // Aplicar permisos al modal de ficha
        const canEdit = window.Utils.checkPermission('Aprobaciones', 'edit');
        const canDelete = window.Utils.checkPermission('Aprobaciones', 'delete');
        document.getElementById('btn-ficha-approve').style.display = canEdit ? 'flex' : 'none';
        document.getElementById('btn-ficha-return').style.display = canEdit ? 'flex' : 'none';
        document.getElementById('btn-ficha-reject').style.display = canDelete ? 'flex' : 'none';

        fichaModal.style.display = 'flex';
        lucide.createIcons();
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
            window.Utils.showToast('Debe agregar un comentario para regresar la solicitud.', 'warning');
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
