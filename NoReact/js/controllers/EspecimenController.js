/** Columnas que acepta el flujo de aprobación al crear el espécimen (ver `aprobaciones.php`). */
const SOLICITUD_ESPECIMEN_ALLOWED = new Set([
    'id_pais',
    'id_estado',
    'id_municipio',
    'id_localidad',
    'id_orden',
    'id_familia',
    'id_subfamilia',
    'id_tribu',
    'id_genero',
    'id_especie',
    'id_tipo',
    'id_colector',
    'id_determinador',
    'id_planta',
    'id_organismo_huesped',
    'id_coleccion',
    'id_cita',
    'anio_identificacion',
    'nombre_comun',
    'nombre_cientifico',
    'fecha_colecta',
    'altitud',
    'datos_ecologicos',
    'num_individuos',
    'envio_identificacion',
    'anio_catalogacion',
    'latitud_n',
    'longitud_o',
    'numero_frasco',
    'status',
]);

class EspecimenController {
    constructor() {
        this.model = window.EspecimenModel;
        this.currentView = 'general';
        this.selectedItem = null;
        this.query = '';
    }

    getUserId() {
        try {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            return u.id ?? u.idUser ?? null;
        } catch (_) {
            return null;
        }
    }

    formDataToPayload(formData) {
        const out = {};
        for (const [k, v] of formData.entries()) {
            if (v === '' || v === null) continue;
            if (/^id_/.test(k)) {
                const n = parseInt(String(v), 10);
                if (!Number.isNaN(n)) out[k] = n;
                continue;
            }
            if (k === 'num_individuos' || k === 'anio_identificacion' || k === 'anio_catalogacion' || k === 'altitud') {
                const n = parseInt(String(v), 10);
                out[k] = Number.isNaN(n) ? v : n;
                continue;
            }
            out[k] = v;
        }
        return out;
    }

    datosPropuestosDesdeFormulario(formData) {
        const raw = this.formDataToPayload(formData);
        const datos = {};
        for (const k of Object.keys(raw)) {
            if (SOLICITUD_ESPECIMEN_ALLOWED.has(k)) datos[k] = raw[k];
        }
        if (!Object.prototype.hasOwnProperty.call(datos, 'status')) datos.status = 1;
        return datos;
    }

    async init() {
        this.container = document.getElementById('especimenes-module');
        if (!this.container) return;

        this.currentView = 'general';
        this.selectedItem = null;
        this.query = '';

        this.setupDelegation();

        await this.model.fetchEspecimenes();
        this.render();
        await this.refreshMisSolicitudes();
        if (window.EspecimenesTutorial) window.EspecimenesTutorial.init();
    }

    setupDelegation() {
        this.container.onclick = (e) => {
            const target = e.target.closest('[id], .btn-back-general, .insect-card');
            if (!target) return;

            if (target.id === 'btn-alta-especimen') {
                this.navigate('alta');
            } else if (target.id === 'btn-solicitar-registro') {
                this.navigate('solicitud');
            } else if (target.id === 'btn-actualizar-especimen' || target.id === 'btn-edit-from-detail') {
                if (!this.selectedItem) {
                    alert('Seleccione un espécimen primero.');
                    return;
                }
                this.navigate('modificar');
            } else if (target.id === 'btn-eliminar-especimen' || target.id === 'btn-delete-from-detail') {
                if (!this.selectedItem) {
                    alert('Seleccione un espécimen primero.');
                    return;
                }
                this.navigate('baja');
            } else if (target.id === 'btn-confirmar-baja-esp') {
                this.handleBajaSubmit();
            } else if (target.id === 'btn-print-from-detail') {
                window.print();
            } else if (target.id === 'breadcrumb-back' || target.classList.contains('btn-back-general')) {
                this.navigate('general');
            }

            const card = target.closest('.insect-card');
            if (card) {
                const id = parseInt(card.dataset.id, 10);
                const item = this.model.items.find((i) => i.id_especimen === id);
                if (item) {
                    this.selectedItem = item;
                    this.navigate('detalle');
                }
            }
        };

        const searchInput = this.container.querySelector('#search-especimen-input');
        if (searchInput) {
            searchInput.oninput = (e) => {
                this.query = e.target.value;
                this.renderCards();
            };
        }

        const formAlta = this.container.querySelector('#alta-especimen-form');
        if (formAlta) formAlta.onsubmit = (e) => this.handleAltaSubmit(e);

        const formMod = this.container.querySelector('#modificar-especimen-form');
        if (formMod) formMod.onsubmit = (e) => this.handleModificarSubmit(e);

        const formSol = this.container.querySelector('#solicitud-especimen-form');
        if (formSol) formSol.onsubmit = (e) => this.handleSolicitudSubmit(e);
    }

    navigate(view) {
        this.currentView = view;
        this.render();
    }

    async afterNavigateCatalogos() {
        const v = this.currentView;
        if (v === 'alta') {
            const f = this.container.querySelector('#alta-especimen-form');
            if (f && window.EspecimenCatalogos) await window.EspecimenCatalogos.fillFormSelects(f);
        } else if (v === 'solicitud') {
            const f = this.container.querySelector('#solicitud-especimen-form');
            if (f && window.EspecimenCatalogos) await window.EspecimenCatalogos.fillFormSelects(f);
        } else if (v === 'modificar') {
            const f = this.container.querySelector('#modificar-especimen-form');
            if (f && window.EspecimenCatalogos) await window.EspecimenCatalogos.fillFormSelects(f);
            this.fillModificarForm();
        }
        lucide.createIcons();
    }

    render() {
        if (!this.container) return;

        const views = ['general', 'alta', 'solicitud', 'modificar', 'baja', 'detalle'];
        views.forEach((v) => {
            const el = this.container.querySelector(`#view-esp-${v}`);
            if (el) el.style.display = v === this.currentView ? 'block' : 'none';
        });

        const breadcrumb = this.container.querySelector('#especimenes-breadcrumb');
        const currentCrumb = this.container.querySelector('#current-crumb');
        if (breadcrumb && currentCrumb) {
            breadcrumb.style.display = this.currentView === 'general' ? 'none' : 'flex';
            if (this.currentView !== 'general') {
                const labels = {
                    alta: 'Nuevo',
                    solicitud: 'Solicitar registro',
                    modificar: 'Actualizar',
                    baja: 'Eliminar',
                    detalle: 'Ficha Técnica',
                };
                currentCrumb.textContent = labels[this.currentView] || this.currentView;
            }
        }

        if (this.currentView === 'general') {
            this.renderCards();
        } else if (this.currentView === 'baja') {
            const nameEl = this.container.querySelector('#baja-esp-name');
            if (nameEl && this.selectedItem) nameEl.textContent = this.selectedItem.nombre_cientifico || this.selectedItem.nombre_comun;
        } else if (this.currentView === 'detalle') {
            this.renderDetalle();
        }

        if (['alta', 'solicitud', 'modificar'].includes(this.currentView)) {
            void this.afterNavigateCatalogos();
        }

        this.applyPermissions();
        lucide.createIcons();
    }

    applyPermissions() {
        const modName = 'Registro de Ejemplares';
        const canAdd = window.Utils.checkPermission(modName, 'add');
        const canEdit = window.Utils.checkPermission(modName, 'edit');
        const canDelete = window.Utils.checkPermission(modName, 'delete');
        const hasModule = window.Utils.hasModuleAccess(modName);

        const btnAlta = this.container.querySelector('#btn-alta-especimen');
        const btnSolicitar = this.container.querySelector('#btn-solicitar-registro');
        const btnEdit = this.container.querySelector('#btn-actualizar-especimen');
        const btnDelete = this.container.querySelector('#btn-eliminar-especimen');

        if (btnAlta) btnAlta.style.display = canAdd ? 'flex' : 'none';
        if (btnSolicitar) btnSolicitar.style.display = hasModule && !canAdd ? 'flex' : 'none';
        if (btnEdit) btnEdit.style.display = canEdit ? 'flex' : 'none';
        if (btnDelete) btnDelete.style.display = canDelete ? 'flex' : 'none';
    }

    renderCards() {
        const grid = this.container.querySelector('#especimen-cards-grid');
        if (!grid) return;

        let filtered = this.model.items;
        if (this.query.trim()) {
            const q = this.query.toLowerCase();
            filtered = filtered.filter(
                (i) =>
                    (i.nombre_comun || '').toLowerCase().includes(q) ||
                    (i.nombre_cientifico || '').toLowerCase().includes(q) ||
                    (i.colector_nombre || '').toLowerCase().includes(q) ||
                    String(i.id_especimen).includes(q)
            );
        }

        grid.innerHTML =
            filtered
                .map(
                    (item) => `
            <div class="insect-card" data-id="${item.id_especimen}" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 12px; cursor: pointer;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                    <span style="font-weight: 700;">#${String(item.id_especimen).padStart(5, '0')}</span>
                    <span class="status-badge" style="background:${item.status == 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color:${item.status == 1 ? '#10B981' : '#EF4444'}; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700;">
                        ${item.status == 1 ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </div>
                <h3 style="margin: 0; font-size: 1.1rem;">${item.nombre_comun || 'Sin nombre'}</h3>
                <p style="margin: 4px 0 12px 0; font-style: italic; color: var(--text-muted); font-size: 0.9rem;">${item.nombre_cientifico || 'N/A'}</p>
            </div>
        `
                )
                .join('') ||
            '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No se encontraron registros.</div>';
    }

    fillModificarForm() {
        const form = this.container.querySelector('#modificar-especimen-form');
        if (!form || !this.selectedItem) return;
        Object.entries(this.selectedItem).forEach(([key, val]) => {
            const input = form.elements[key];
            if (!input) return;
            if (input.type === 'date' && val) input.value = String(val).split('T')[0];
            else if (val !== undefined && val !== null) input.value = val;
        });
    }

    renderDetalle() {
        const detailContent = this.container.querySelector('#especimen-detalle-content');
        if (!detailContent || !this.selectedItem) return;
        const s = this.selectedItem;
        const row = (label, val) =>
            `<p style="margin:0.35rem 0;"><strong>${label}:</strong> ${val != null && val !== '' ? String(val) : '—'}</p>`;
        detailContent.innerHTML = `
            <div class="form-card" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 2.5rem; border-radius: 16px;">
                <h3 style="color: var(--accent-color); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-top:0;">${s.nombre_cientifico || 'Detalle'}</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem;margin-top:1rem;">
                    <div>
                        <h4 style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 0.5rem;">Identificación</h4>
                        ${row('Nombre común', s.nombre_comun)}
                        ${row('Orden', s.orden_nombre)}
                        ${row('Familia', s.familia_nombre)}
                        ${row('Subfamilia', s.subfamilia_nombre)}
                        ${row('Tribu', s.tribu_nombre)}
                        ${row('Género', s.genero_nombre)}
                        ${row('Especie (catálogo)', s.especie_nombre)}
                        ${row('Tipo', s.tipo_nombre)}
                    </div>
                    <div>
                        <h4 style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 0.5rem;">Colecta</h4>
                        ${row('Fecha colecta', s.fecha_colecta ? String(s.fecha_colecta).split('T')[0] : '')}
                        ${row('Colector', s.colector_nombre)}
                        ${row('Determinador', s.determinador_nombre)}
                        ${row('Año identificación', s.anio_identificacion)}
                        ${row('N.º individuos', s.num_individuos)}
                    </div>
                    <div>
                        <h4 style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 0.5rem;">Ubicación</h4>
                        ${row('País', s.pais_nombre)}
                        ${row('Estado', s.estado_nombre)}
                        ${row('Municipio', s.municipio_nombre)}
                        ${row('Localidad', s.localidad_nombre)}
                        ${row('Latitud N', s.latitud_n)}
                        ${row('Longitud O', s.longitud_o)}
                        ${row('Altitud (m)', s.altitud)}
                    </div>
                    <div>
                        <h4 style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 0.5rem;">Ecología y colección</h4>
                        ${row('Datos ecológicos', s.datos_ecologicos)}
                        ${row('Planta hospedera', s.planta_nombre || s.planta_nombre_comun)}
                        ${row('Organismo huésped', s.organismo_nombre)}
                        ${row('Colección', s.coleccion_nombre)}
                        ${row('Cita', s.cita_titulo)}
                        ${row('Autores (cita)', s.cita_autores)}
                        ${row('Año (cita)', s.cita_anio)}
                    </div>
                    <div>
                        <h4 style="color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 0.5rem;">Control</h4>
                        ${row('N.º frasco', s.numero_frasco)}
                        ${row('Año catalogación', s.anio_catalogacion)}
                        ${row('Envío identificación', s.envio_identificacion)}
                        ${row('Estado registro', s.status == 1 ? 'Activo' : 'Inactivo')}
                    </div>
                </div>
            </div>
        `;
    }

    async refreshMisSolicitudes() {
        const box = this.container.querySelector('#mis-solicitudes-body');
        if (!box) return;
        const uid = this.getUserId();
        if (!uid) {
            box.innerHTML = '<p style="margin:0;color:var(--text-muted);">Inicie sesión para ver solicitudes.</p>';
            return;
        }
        box.innerHTML = '<p style="margin:0;color:var(--text-muted);">Cargando…</p>';
        const rows = await this.model.fetchMisSolicitudes(uid);
        if (!rows.length) {
            box.innerHTML = '<p style="margin:0;color:var(--text-muted);">No hay solicitudes registradas.</p>';
            return;
        }
        box.innerHTML = rows
            .map((r) => {
                const fc = r.fecha_creacion ? String(r.fecha_creacion).replace('T', ' ').slice(0, 19) : '';
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid var(--border-color);">
                    <span>#${r.id_solicitud} · <strong>${r.estado || ''}</strong></span>
                    <span style="font-size:0.8rem;color:var(--text-muted);">${fc}</span>
                </div>`;
            })
            .join('');
    }

    async handleAltaSubmit(e) {
        e.preventDefault();
        try {
            const payload = this.formDataToPayload(new FormData(e.target));
            await this.model.createEspecimen(payload);
            await this.model.fetchEspecimenes();
            e.target.reset();
            this.navigate('general');
            window.Utils.showToast('Espécimen guardado.', 'success');
        } catch (err) {
            window.Utils.showToast(err.message || 'Error al guardar', 'danger');
        }
    }

    async handleModificarSubmit(e) {
        e.preventDefault();
        try {
            const payload = this.formDataToPayload(new FormData(e.target));
            await this.model.updateEspecimen(this.selectedItem.id_especimen, payload);
            await this.model.fetchEspecimenes();
            this.navigate('general');
            window.Utils.showToast('Actualizado.', 'success');
        } catch (err) {
            window.Utils.showToast(err.message || 'Error al actualizar', 'danger');
        }
    }

    async handleSolicitudSubmit(e) {
        e.preventDefault();
        const uid = this.getUserId();
        if (!uid) {
            alert('No se pudo obtener el usuario.');
            return;
        }
        try {
            const datos = this.datosPropuestosDesdeFormulario(new FormData(e.target));
            if (!datos.nombre_cientifico || String(datos.nombre_cientifico).trim() === '') {
                alert('El nombre científico es obligatorio en la solicitud.');
                return;
            }
            await this.model.createSolicitud(uid, datos);
            e.target.reset();
            await this.refreshMisSolicitudes();
            this.navigate('general');
            window.Utils.showToast('Solicitud enviada. Revise el estado en el panel inferior o en Aprobaciones.', 'success');
        } catch (err) {
            window.Utils.showToast(err.message || 'Error al enviar la solicitud', 'danger');
        }
    }

    async handleBajaSubmit() {
        try {
            await this.model.deleteEspecimen(this.selectedItem.id_especimen);
            await this.model.fetchEspecimenes();
            this.navigate('general');
            window.Utils.showToast('Baja registrada.', 'success');
        } catch (err) {
            window.Utils.showToast(err.message || 'Error al eliminar', 'danger');
        }
    }
}

window.EspecimenController = new EspecimenController();
