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
        this.altaSelects = {};
        this.solicitudSelects = {};
        this.editarSolicitudSelects = {};
        this.altaInitialized = false;
        this.selectedSolicitudRegresada = null; // solicitud REGRESADA seleccionada para editar
    }

    getUserId() {
        try {
            const u = JSON.parse(sessionStorage.getItem('user') || '{}');
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
        this.altaSelects = {};
        this.altaInitialized = false;

        this.setupDelegation();

        // Fetch data + catalogos in parallel
        await Promise.all([
            this.model.fetchEspecimenes(),
            this.loadCatalogos()
        ]);
        this.render();
        if (!this.isAdmin) {
            await this.refreshMisSolicitudes();
        }
        if (window.EspecimenesTutorial) window.EspecimenesTutorial.init();
    }

    async loadCatalogos() {
        try {
            await this.model.fetchCatalogos();
        } catch (err) {
            console.error('loadCatalogos error:', err);
        }
    }

    setupDelegation() {
        this.container.onclick = (e) => {
            const target = e.target.closest('[id], .btn-back-general, .insect-card');
            if (!target) return;

            if (target.id === 'btn-alta-especimen') {
                this.navigate('alta');
            } else if (target.id === 'btn-solicitar-registro') {
                this.navigate('solicitud');
            } else if (target.id === 'btn-editar-solicitud') {
                this.navigate('editar-solicitud');
            } else if (target.id === 'btn-actualizar-especimen' || target.id === 'btn-edit-from-detail') {
                if (!this.selectedItem) {
                    window.Utils.showToast('Seleccione un espécimen primero.', 'warning');
                    return;
                }
                this.navigate('modificar');
            } else if (target.id === 'btn-eliminar-especimen' || target.id === 'btn-delete-from-detail') {
                if (!this.selectedItem) {
                    window.Utils.showToast('Seleccione un espécimen primero.', 'warning');
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

        const formEdit = this.container.querySelector('#editar-solicitud-form');
        if (formEdit) formEdit.onsubmit = (e) => this.handleEditarSolicitudSubmit(e);
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
        } else if (v === 'editar-solicitud') {
            const f = this.container.querySelector('#editar-solicitud-form');
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

        const views = ['general', 'alta', 'solicitud', 'modificar', 'baja', 'detalle', 'editar-solicitud'];
        views.forEach((v) => {
            const el = this.container.querySelector(`#view-esp-${v}`);
            if (el) el.style.display = v === this.currentView ? '' : 'none';
        });

        const breadcrumb = this.container.querySelector('#especimenes-breadcrumb');
        const currentCrumb = this.container.querySelector('#current-crumb');
        if (breadcrumb && currentCrumb) {
            breadcrumb.style.display = this.currentView === 'general' ? 'none' : 'flex';
            if (this.currentView !== 'general') {
                const labels = {
                    alta: 'Nuevo',
                    solicitud: 'Nueva Solicitud',
                    modificar: 'Actualizar',
                    baja: 'Eliminar',
                    detalle: 'Ficha Técnica',
                    'editar-solicitud': 'Editar Solicitud',
                };
                currentCrumb.textContent = labels[this.currentView] || this.currentView;
            }
        }

        if (this.currentView === 'general') {
            this.renderCards();
        } else if (this.currentView === 'alta') {
            this.initAltaForm();
        } else if (this.currentView === 'solicitud') {
            this.initSolicitudForm();
        } else if (this.currentView === 'editar-solicitud') {
            this.initEditarSolicitudForm();
        } else if (this.currentView === 'modificar') {
            this.renderModificarForm();
        } else if (this.currentView === 'baja') {
            const nameEl = this.container.querySelector('#baja-esp-name');
            if (nameEl && this.selectedItem) nameEl.textContent = this.selectedItem.nombre_cientifico || this.selectedItem.nombre_comun;
        } else if (this.currentView === 'detalle') {
            this.renderDetalle();
        }

        if (['alta', 'solicitud', 'modificar', 'editar-solicitud'].includes(this.currentView)) {
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

        const isAdmin = canAdd && canEdit && canDelete;
        this.isAdmin = isAdmin;
        const isCapturista = hasModule && !canAdd; // tiene acceso pero no puede insertar directo

        const btnAlta = this.container.querySelector('#btn-alta-especimen');
        const btnSolicitar = this.container.querySelector('#btn-solicitar-registro');
        const btnEditarSol = this.container.querySelector('#btn-editar-solicitud');
        const btnEdit = this.container.querySelector('#btn-actualizar-especimen');
        const btnDelete = this.container.querySelector('#btn-eliminar-especimen');
        const panelMisSolicitudes = this.container.querySelector('#panel-mis-solicitudes');

        if (btnAlta) btnAlta.style.display = canAdd ? 'flex' : 'none';
        if (btnSolicitar) btnSolicitar.style.display = isCapturista ? 'flex' : 'none';
        // El btn Editar Solicitud se muestra solo si capturista Y tiene alguna REGRESADA
        if (btnEditarSol) btnEditarSol.style.display = 'none'; // se actualiza en refreshMisSolicitudes
        if (btnEdit) btnEdit.style.display = canEdit && !isCapturista ? 'flex' : 'none';
        if (btnDelete) btnDelete.style.display = canDelete && !isCapturista ? 'flex' : 'none';
        if (panelMisSolicitudes) panelMisSolicitudes.style.display = isAdmin ? 'none' : '';
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
        // Compatibilidad: ahora usamos renderModificarForm
        this.renderModificarForm();
    }

    async _ensureCatalogos() {
        if (this.model.catalogos) return this.model.catalogos;
        if (typeof this.model.fetchCatalogos === 'function') {
            return await this.model.fetchCatalogos();
        }
        // Fallback inline si no existe el método en el modelo
        const sections = ['pais','estado','municipio','localidad','orden','familia','subfamilia','tribu','genero','especie','tipo','colector','determinador','planta_hospedera','organismo_hospedero','coleccion','cita'];
        try {
            const results = await Promise.all(sections.map(s =>
                fetch(`../api/catalogos.php?section=${s}`).then(r => r.ok ? r.json() : []).catch(() => [])
            ));
            this.model.catalogos = {};
            sections.forEach((s, i) => { this.model.catalogos[s] = Array.isArray(results[i]) ? results[i] : []; });
            return this.model.catalogos;
        } catch (err) {
            console.error('Error cargando catálogos:', err);
            this.model.catalogos = {};
            sections.forEach(s => { this.model.catalogos[s] = []; });
            return this.model.catalogos;
        }
    }

    /**
     * Mapea registro genérico de catálogo a {value, label} considerando
     * las distintas convenciones de nombre que devuelve la API.
     */
    _toOption(item, section) {
        if (!item) return null;
        const idKeyMap = {
            pais: ['idPais','id_pais'],
            estado: ['idEstado','id_estado'],
            municipio: ['idMunicipio','id_municipio'],
            localidad: ['idLocalidad','id_localidad'],
            orden: ['idOrden','id_orden'],
            familia: ['idFamilia','id_familia'],
            subfamilia: ['idSubfamilia','id_subfamilia'],
            tribu: ['idTribu','id_tribu'],
            genero: ['idGenero','id_genero'],
            especie: ['idEspecie','id_especie'],
            tipo: ['idTipo','id_tipo'],
            colector: ['idColector','id_colector'],
            determinador: ['idDeterminador','id_determinador'],
            planta_hospedera: ['idPlanta','id_planta'],
            organismo_hospedero: ['idOrganismo','id_organismo','id_organismo_huesped'],
            coleccion: ['idColeccion','id_coleccion'],
            cita: ['idCita','id_cita'],
        };
        const keys = idKeyMap[section] || [];
        let id = '';
        for (const k of keys) { if (item[k] != null) { id = item[k]; break; } }

        let label = '';
        switch (section) {
            case 'especie':
                label = (item.nombre || '') + (item.subespecie ? ` ${item.subespecie}` : '');
                break;
            case 'colector':
            case 'determinador':
                label = `${item.nombre || ''} ${item.apellido_paterno || ''}`.trim();
                break;
            case 'planta_hospedera':
                label = item.nombre_cientifico || item.nombre_comun || '';
                break;
            case 'organismo_hospedero':
                label = item.nombre_organismo || item.nombre || '';
                break;
            case 'coleccion':
                label = item.acronimo ? `${item.acronimo} — ${item.nombre_institucion || ''}` : (item.nombre_institucion || '');
                break;
            case 'cita':
                label = item.titulo || '';
                if (item.anio) label = `${item.anio} — ${label}`;
                break;
            default:
                label = item.nombre || '';
        }
        return { value: String(id), label: label || `#${id}`, _raw: item };
    }

    _filterByParent(list, parentField, parentValue) {
        if (!parentValue) return [];
        const pv = String(parentValue);
        return list.filter(it => {
            const camel = parentField.replace(/_([a-z])/g, (_,c) => c.toUpperCase());
            const v = it[parentField] != null ? it[parentField] : it[camel];
            return v != null && String(v) === pv;
        });
    }

    async renderModificarForm() {
        const form = this.container.querySelector('#modificar-especimen-form');
        if (!form || !this.selectedItem) return;

        const s = this.selectedItem;

        // Subtítulo
        const sub = this.container.querySelector('#mod-esp-subtitle');
        if (sub) {
            sub.textContent = `Editando: #${String(s.id_especimen).padStart(5, '0')} — ${s.especie_nombre || s.nombre_cientifico || 'Sin identificar'}`;
        }

        // Pre-llenar campos input/textarea simples
        const setInput = (name, val) => {
            const el = form.elements[name];
            if (!el) return;
            if (el.type === 'date' && val) el.value = String(val).slice(0, 10);
            else el.value = (val == null ? '' : val);
        };
        setInput('nombre_comun', s.nombre_comun);
        setInput('nombre_cientifico', s.nombre_cientifico);
        setInput('num_individuos', s.num_individuos != null ? s.num_individuos : 1);
        setInput('fecha_colecta', s.fecha_colecta);
        setInput('anio_identificacion', s.anio_identificacion);
        setInput('anio_catalogacion', s.anio_catalogacion);
        setInput('numero_frasco', s.numero_frasco);
        setInput('envio_identificacion', s.envio_identificacion);
        setInput('altitud', s.altitud);
        setInput('latitud_n', s.latitud_n);
        setInput('longitud_o', s.longitud_o);
        setInput('datos_ecologicos', s.datos_ecologicos);

        // Cargar catálogos (si ya estaban cacheados, regresa al instante)
        const cat = await this._ensureCatalogos();

        // Helpers para construir opciones
        const opts = (section) =>
            (cat[section] || []).map(it => this._toOption(it, section)).filter(o => o && o.value);

        // Destruir selects previos si re-render
        if (this._modSelects) {
            Object.values(this._modSelects).forEach(sel => { try { sel.destroy(); } catch (e) {} });
        }
        this._modSelects = {};

        const mountSel = (containerId, name, options, value, placeholder, onChange) => {
            const cnt = this.container.querySelector('#' + containerId);
            if (!cnt) return null;
            const sel = new window.CustomSelect(cnt, {
                options,
                value: value != null ? String(value) : '',
                placeholder: placeholder || 'Seleccionar...',
                searchable: true,
                name,
                onChange: onChange || function(){}
            });
            this._modSelects[name] = sel;
            return sel;
        };

        // === TAXONOMÍA (cascada) ===
        const ordenes = opts('orden');
        const allFamilias = opts('familia');
        const allSubfamilias = opts('subfamilia');
        const allTribus = opts('tribu');
        const allGeneros = opts('genero');
        const allEspecies = opts('especie');
        const tipos = opts('tipo');

        const filterByParent = (list, parentField, parentValue) => {
            if (!parentValue) return list;
            const pv = String(parentValue);
            return list.filter(o => {
                const raw = o._raw || {};
                const camel = parentField.replace(/_([a-z])/g, (_,c) => c.toUpperCase());
                const v = raw[parentField] != null ? raw[parentField] : raw[camel];
                return v != null && String(v) === pv;
            });
        };

        mountSel('mod-sel-orden', 'id_orden', ordenes, s.id_orden, 'Seleccionar orden...', (v) => {
            const fams = filterByParent(allFamilias, 'id_orden', v);
            this._modSelects.id_familia.setOptions(fams);
            this._modSelects.id_familia.setValue('');
            this._modSelects.id_subfamilia.setOptions([]); this._modSelects.id_subfamilia.setValue('');
            this._modSelects.id_tribu.setOptions([]); this._modSelects.id_tribu.setValue('');
            this._modSelects.id_genero.setOptions([]); this._modSelects.id_genero.setValue('');
            this._modSelects.id_especie.setOptions([]); this._modSelects.id_especie.setValue('');
        });
        mountSel('mod-sel-familia', 'id_familia', filterByParent(allFamilias, 'id_orden', s.id_orden), s.id_familia, 'Seleccionar familia...', (v) => {
            const subs = filterByParent(allSubfamilias, 'id_familia', v);
            this._modSelects.id_subfamilia.setOptions(subs);
            this._modSelects.id_subfamilia.setValue('');
            this._modSelects.id_tribu.setOptions([]); this._modSelects.id_tribu.setValue('');
            this._modSelects.id_genero.setOptions([]); this._modSelects.id_genero.setValue('');
            this._modSelects.id_especie.setOptions([]); this._modSelects.id_especie.setValue('');
        });
        mountSel('mod-sel-subfamilia', 'id_subfamilia', filterByParent(allSubfamilias, 'id_familia', s.id_familia), s.id_subfamilia, 'Seleccionar subfamilia...', (v) => {
            const tr = filterByParent(allTribus, 'id_subfamilia', v);
            this._modSelects.id_tribu.setOptions(tr);
            this._modSelects.id_tribu.setValue('');
            this._modSelects.id_genero.setOptions([]); this._modSelects.id_genero.setValue('');
            this._modSelects.id_especie.setOptions([]); this._modSelects.id_especie.setValue('');
        });
        mountSel('mod-sel-tribu', 'id_tribu', filterByParent(allTribus, 'id_subfamilia', s.id_subfamilia), s.id_tribu, 'Seleccionar tribu...', (v) => {
            const gs = filterByParent(allGeneros, 'id_tribu', v);
            this._modSelects.id_genero.setOptions(gs);
            this._modSelects.id_genero.setValue('');
            this._modSelects.id_especie.setOptions([]); this._modSelects.id_especie.setValue('');
        });
        mountSel('mod-sel-genero', 'id_genero', filterByParent(allGeneros, 'id_tribu', s.id_tribu), s.id_genero, 'Seleccionar género...', (v) => {
            const es = filterByParent(allEspecies, 'id_genero', v);
            this._modSelects.id_especie.setOptions(es);
            this._modSelects.id_especie.setValue('');
        });
        mountSel('mod-sel-especie', 'id_especie', filterByParent(allEspecies, 'id_genero', s.id_genero), s.id_especie, 'Seleccionar especie...');
        mountSel('mod-sel-tipo', 'id_tipo', tipos, s.id_tipo, 'Seleccionar tipo...');

        // === GEOGRAFÍA (cascada pais → estado → municipio → localidad) ===
        const paises = opts('pais');
        const allEstados = opts('estado');
        const allMunicipios = opts('municipio');
        const allLocalidades = opts('localidad');

        mountSel('mod-sel-pais', 'id_pais', paises, s.id_pais, 'Seleccionar país...', (v) => {
            const es = filterByParent(allEstados, 'id_pais', v);
            this._modSelects.id_estado.setOptions(es); this._modSelects.id_estado.setValue('');
            this._modSelects.id_municipio.setOptions([]); this._modSelects.id_municipio.setValue('');
            this._modSelects.id_localidad.setOptions([]); this._modSelects.id_localidad.setValue('');
        });
        mountSel('mod-sel-estado', 'id_estado', filterByParent(allEstados, 'id_pais', s.id_pais), s.id_estado, 'Seleccionar estado...', (v) => {
            const ms = filterByParent(allMunicipios, 'id_estado', v);
            this._modSelects.id_municipio.setOptions(ms); this._modSelects.id_municipio.setValue('');
            this._modSelects.id_localidad.setOptions([]); this._modSelects.id_localidad.setValue('');
        });
        mountSel('mod-sel-municipio', 'id_municipio', filterByParent(allMunicipios, 'id_estado', s.id_estado), s.id_municipio, 'Seleccionar municipio...', (v) => {
            const ls = filterByParent(allLocalidades, 'id_municipio', v);
            this._modSelects.id_localidad.setOptions(ls); this._modSelects.id_localidad.setValue('');
        });
        mountSel('mod-sel-localidad', 'id_localidad', filterByParent(allLocalidades, 'id_municipio', s.id_municipio), s.id_localidad, 'Seleccionar localidad...');

        // === BIOLÓGICOS ===
        mountSel('mod-sel-planta', 'id_planta', opts('planta_hospedera'), s.id_planta, 'Seleccionar planta...');
        mountSel('mod-sel-organismo', 'id_organismo_huesped', opts('organismo_hospedero'), s.id_organismo_huesped, 'Seleccionar organismo...');

        // === CATALOGACIÓN ===
        mountSel('mod-sel-colector', 'id_colector', opts('colector'), s.id_colector, 'Seleccionar colector...');
        mountSel('mod-sel-determinador', 'id_determinador', opts('determinador'), s.id_determinador, 'Seleccionar determinador...');
        mountSel('mod-sel-coleccion', 'id_coleccion', opts('coleccion'), s.id_coleccion, 'Seleccionar colección...');
        mountSel('mod-sel-cita', 'id_cita', opts('cita'), s.id_cita, 'Seleccionar cita...');

        if (window.lucide) lucide.createIcons();
    }

    renderDetalle() {
        const detailContent = this.container.querySelector('#especimen-detalle-content');
        if (!detailContent || !this.selectedItem) return;
        const s = this.selectedItem;
        const val = (v) => (v === null || v === undefined || v === '') ? '—' : v;
        const year = s.fecha_colecta ? new Date(s.fecha_colecta).getFullYear() : '—';
        const dateFmt = s.fecha_colecta ? new Date(s.fecha_colecta).toLocaleDateString() : '—';

        const pill = (text, cls) => text ? `<span class="ft-pill ${cls}">${text}</span>` : '';
        const field = (label, value, italic = false) =>
            `<div class="ft-field">
                <span class="ft-label">${label}</span>
                <span class="ft-value${italic ? ' ft-italic' : ''}">${val(value)}</span>
            </div>`;

        detailContent.innerHTML = `
          <div class="ft-modal" style="position:relative;max-width:none;width:100%;box-shadow:none;">
            <div class="ft-scroll">
              <header class="ft-header">
                <h1 class="ft-title">FICHA TÉCNICA</h1>
                <p class="ft-subtitle">Colección Entomológica</p>
                <div class="ft-header-row">
                  ${field('Colector', s.colector_nombre)}
                  ${field('Año de Catalogación', s.anio_catalogacion)}
                </div>
              </header>

              <section class="ft-section ft-hero-section">
                <div class="ft-hero-info">
                  <h2 class="ft-common-name">${val(s.nombre_comun)}</h2>
                  <p class="ft-scientific-name"><i>${val(s.nombre_cientifico)}</i></p>
                  <div class="ft-taxonomy-pills">
                    ${pill(s.orden_nombre, 'ft-pill-order')}
                    ${pill(s.familia_nombre, 'ft-pill-family')}
                    ${pill(s.tribu_nombre, 'ft-pill-tribu')}
                  </div>
                </div>
                <div class="ft-hero-image">
                  <i data-lucide="bug" style="width:56px;height:56px;opacity:0.5;"></i>
                </div>
              </section>

              <section class="ft-section">
                <h3 class="ft-section-title">Datos de Identificación</h3>
                <div class="ft-grid ft-grid-2">
                  ${field('Nombre Común', s.nombre_comun)}
                  ${field('Colección', s.coleccion_nombre)}
                </div>
              </section>

              <section class="ft-section">
                <h3 class="ft-section-title">Datos de Colecta</h3>
                <div class="ft-grid ft-grid-3">
                  ${field('Año', year)}
                  ${field('País', s.pais_nombre)}
                  ${field('Estado', s.estado_nombre)}
                </div>
                <div class="ft-grid ft-grid-2">
                  ${field('Localidad', s.localidad_nombre)}
                  ${field('Fecha de Colecta', dateFmt)}
                </div>
                <div class="ft-grid ft-grid-2">
                  ${field('Altitud', s.altitud ? `${s.altitud} m` : null)}
                  ${field('Número de Individuos', s.num_individuos)}
                </div>
              </section>

              <section class="ft-section">
                <h3 class="ft-section-title">Ubicación Geográfica</h3>
                <div class="ft-grid ft-grid-2">
                  ${field('Latitud', s.latitud_n ? `${s.latitud_n}°` : null)}
                  ${field('Longitud', s.longitud_o ? `${s.longitud_o}°` : null)}
                </div>
              </section>

              <section class="ft-section">
                <h3 class="ft-section-title">Datos Biológicos</h3>
                <div class="ft-grid ft-grid-2">
                  ${field('Tribu', s.tribu_nombre)}
                  ${field('Subfamilia', s.subfamilia_nombre)}
                  ${field('Género', s.genero_nombre, true)}
                  ${field('Especie', s.especie_nombre, true)}
                  ${field('Planta Hospedera', s.planta_nombre, true)}
                  ${field('Organismo Huésped / Presa', s.organismo_nombre, true)}
                </div>
              </section>

              <section class="ft-section">
                <h3 class="ft-section-title">Catalogación</h3>
                <div class="ft-grid ft-grid-2">
                  ${field('Determinador', s.determinador_nombre)}
                  ${field('Año de Identificación', s.anio_identificacion)}
                  ${field('Año de Catalogación', s.anio_catalogacion)}
                  ${field('Número de Frasco', s.numero_frasco)}
                  ${field('Tipo', s.tipo_nombre)}
                  ${field('Envío Identificación', s.envio_identificacion)}
                </div>
                <div class="ft-grid ft-grid-1">
                  ${field('Cita Bibliográfica', s.cita_nombre)}
                </div>
              </section>

              <section class="ft-section">
                <h3 class="ft-section-title">Datos Ecológicos / Taxonómicos</h3>
                <div class="ft-notes">
                  ${s.datos_ecologicos || 'Sin datos ecológicos registrados.'}
                </div>
              </section>
            </div>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
    }

    // ── Alta form: initialize all CustomSelects + cascades ──
    initAltaForm() {
        const form = this.container.querySelector('#alta-especimen-form');
        if (!form) return;

        // Reset native inputs
        form.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], textarea').forEach(el => {
            if (el.name === 'num_individuos') el.value = '1';
            else el.value = '';
        });

        // Destroy previous instances
        Object.values(this.altaSelects).forEach(s => { try { s.destroy(); } catch (e) {} });
        this.altaSelects = {};

        const cat = this.model.catalogos;

        // Build options helpers
        const optsFromList = (list, idKey, labelFn) =>
            (list || []).map(item => ({ value: String(item[idKey]), label: labelFn(item) }));

        const ordenOpts = optsFromList(cat.orden, 'idOrden', o => o.nombre);
        const tipoOpts = optsFromList(cat.tipo, 'idTipo', t => t.nombre);
        const paisOpts = optsFromList(cat.pais, 'idPais', p => p.nombre);
        const plantaOpts = optsFromList(cat.planta_hospedera, 'idPlanta',
            p => p.nombre_cientifico + (p.nombre_comun ? ` (${p.nombre_comun})` : ''));
        const organismoOpts = optsFromList(cat.organismo_hospedero, 'idOrganismo', o => o.nombre_organismo);
        const colectorOpts = optsFromList(cat.colector, 'idColector',
            c => `${c.nombre} ${c.apellido_paterno || ''}`.trim());
        const determinadorOpts = optsFromList(cat.determinador, 'idDeterminador',
            d => `${d.nombre} ${d.apellido_paterno || ''}`.trim());
        const coleccionOpts = optsFromList(cat.coleccion, 'idColeccion',
            c => `${c.acronimo} — ${c.nombre_institucion || ''}`);
        const citaOpts = optsFromList(cat.cita, 'idCita',
            c => `${c.anio ? c.anio + ' — ' : ''}${c.titulo}`);

        const mk = (key, name, options, placeholder, extra = {}) => {
            const host = form.querySelector(`[data-cs="${key}"]`);
            if (!host) return null;
            const sel = new CustomSelect(host, Object.assign({
                options, value: '', placeholder,
                searchable: true, name
            }, extra));
            this.altaSelects[key] = sel;
            return sel;
        };

        // Geo cascade: País → Estado → Municipio → Localidad
        mk('id_pais', 'id_pais', paisOpts, 'Seleccionar país...', {
            onChange: (v) => {
                this.altaSelects.id_estado.setValue('');
                this.altaSelects.id_estado.setOptions(
                    v ? optsFromList((cat.estado || []).filter(e => String(e.idPais) === String(v)), 'idEstado', e => e.nombre) : []
                );
                this.altaSelects.id_municipio.setValue('');
                this.altaSelects.id_municipio.setOptions([]);
                this.altaSelects.id_localidad.setValue('');
                this.altaSelects.id_localidad.setOptions([]);
            }
        });
        mk('id_estado', 'id_estado', [], 'Selecciona país primero...', {
            onChange: (v) => {
                this.altaSelects.id_municipio.setValue('');
                this.altaSelects.id_municipio.setOptions(
                    v ? optsFromList((cat.municipio || []).filter(m => String(m.idEstado) === String(v)), 'idMunicipio', m => m.nombre) : []
                );
                this.altaSelects.id_localidad.setValue('');
                this.altaSelects.id_localidad.setOptions([]);
            }
        });
        mk('id_municipio', 'id_municipio', [], 'Selecciona estado primero...', {
            onChange: (v) => {
                this.altaSelects.id_localidad.setValue('');
                this.altaSelects.id_localidad.setOptions(
                    v ? optsFromList((cat.localidad || []).filter(l => String(l.idMunicipio) === String(v)), 'idLocalidad', l => l.nombre) : []
                );
            }
        });
        mk('id_localidad', 'id_localidad', [], 'Selecciona municipio primero...');

        // Taxonomy cascade: Orden → Familia → Subfamilia → Tribu → Género → Especie
        mk('id_orden', 'id_orden', ordenOpts, 'Seleccionar orden...', {
            onChange: (v) => {
                this.altaSelects.id_familia.setValue('');
                this.altaSelects.id_familia.setOptions(
                    v ? optsFromList((cat.familia || []).filter(f => String(f.idOrden) === String(v)), 'idFamilia', f => f.nombre) : []
                );
                ['id_subfamilia', 'id_tribu', 'id_genero', 'id_especie'].forEach(k => {
                    this.altaSelects[k].setValue('');
                    this.altaSelects[k].setOptions([]);
                });
            }
        });
        mk('id_familia', 'id_familia', [], 'Selecciona orden primero...', {
            onChange: (v) => {
                this.altaSelects.id_subfamilia.setValue('');
                this.altaSelects.id_subfamilia.setOptions(
                    v ? optsFromList((cat.subfamilia || []).filter(s => String(s.idFamilia) === String(v)), 'idSubfamilia', s => s.nombre) : []
                );
                ['id_tribu', 'id_genero', 'id_especie'].forEach(k => {
                    this.altaSelects[k].setValue('');
                    this.altaSelects[k].setOptions([]);
                });
            }
        });
        mk('id_subfamilia', 'id_subfamilia', [], 'Selecciona familia primero...', {
            onChange: (v) => {
                this.altaSelects.id_tribu.setValue('');
                this.altaSelects.id_tribu.setOptions(
                    v ? optsFromList((cat.tribu || []).filter(t => String(t.idSubfamilia) === String(v)), 'idTribu', t => t.nombre) : []
                );
                ['id_genero', 'id_especie'].forEach(k => {
                    this.altaSelects[k].setValue('');
                    this.altaSelects[k].setOptions([]);
                });
            }
        });
        mk('id_tribu', 'id_tribu', [], 'Selecciona subfamilia primero...', {
            onChange: (v) => {
                this.altaSelects.id_genero.setValue('');
                this.altaSelects.id_genero.setOptions(
                    v ? optsFromList((cat.genero || []).filter(g => String(g.idTribu) === String(v)), 'idGenero', g => g.nombre) : []
                );
                this.altaSelects.id_especie.setValue('');
                this.altaSelects.id_especie.setOptions([]);
            }
        });
        mk('id_genero', 'id_genero', [], 'Selecciona tribu primero...', {
            onChange: (v) => {
                this.altaSelects.id_especie.setValue('');
                this.altaSelects.id_especie.setOptions(
                    v ? optsFromList((cat.especie || []).filter(e => String(e.idGenero) === String(v)), 'idEspecie',
                        e => e.nombre + (e.subespecie ? ` ${e.subespecie}` : '')) : []
                );
            }
        });
        mk('id_especie', 'id_especie', [], 'Selecciona género primero...');

        // Independent selects
        mk('id_tipo', 'id_tipo', tipoOpts, 'Seleccionar tipo...');
        mk('id_planta', 'id_planta', plantaOpts, 'Seleccionar planta hospedera...');
        mk('id_organismo_huesped', 'id_organismo_huesped', organismoOpts, 'Seleccionar organismo huésped...');
        mk('id_colector', 'id_colector', colectorOpts, 'Seleccionar colector...');
        mk('id_determinador', 'id_determinador', determinadorOpts, 'Seleccionar determinador...');
        mk('id_coleccion', 'id_coleccion', coleccionOpts, 'Seleccionar colección...');
        mk('id_cita', 'id_cita', citaOpts, 'Seleccionar cita...');

        this.altaInitialized = true;
    }

    // ── Solicitud form: initialize all CustomSelects + cascades ──
    initSolicitudForm() {
        const form = this.container.querySelector('#solicitud-especimen-form');
        if (!form) return;

        // Reset native inputs
        form.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], textarea').forEach(el => {
            if (el.name === 'num_individuos') el.value = '1';
            else el.value = '';
        });

        // Destroy previous instances
        Object.values(this.solicitudSelects).forEach(s => { try { s.destroy(); } catch (e) {} });
        this.solicitudSelects = {};

        const cat = this.model.catalogos;

        // Build options helpers
        const optsFromList = (list, idKey, labelFn) =>
            (list || []).map(item => ({ value: String(item[idKey]), label: labelFn(item) }));

        const ordenOpts = optsFromList(cat.orden, 'idOrden', o => o.nombre);
        const tipoOpts = optsFromList(cat.tipo, 'idTipo', t => t.nombre);
        const paisOpts = optsFromList(cat.pais, 'idPais', p => p.nombre);
        const plantaOpts = optsFromList(cat.planta_hospedera, 'idPlanta',
            p => p.nombre_cientifico + (p.nombre_comun ? ` (${p.nombre_comun})` : ''));
        const organismoOpts = optsFromList(cat.organismo_hospedero, 'idOrganismo', o => o.nombre_organismo);
        const colectorOpts = optsFromList(cat.colector, 'idColector',
            c => `${c.nombre} ${c.apellido_paterno || ''}`.trim());
        const determinadorOpts = optsFromList(cat.determinador, 'idDeterminador',
            d => `${d.nombre} ${d.apellido_paterno || ''}`.trim());
        const coleccionOpts = optsFromList(cat.coleccion, 'idColeccion',
            c => `${c.acronimo} — ${c.nombre_institucion || ''}`);
        const citaOpts = optsFromList(cat.cita, 'idCita',
            c => `${c.anio ? c.anio + ' — ' : ''}${c.titulo}`);

        const mk = (key, name, options, placeholder, extra = {}) => {
            const host = form.querySelector(`[data-cs="${key}"]`);
            if (!host) return null;
            const sel = new CustomSelect(host, Object.assign({
                options, value: '', placeholder,
                searchable: true, name
            }, extra));
            this.solicitudSelects[key] = sel;
            return sel;
        };

        // Geo cascade: País → Estado → Municipio → Localidad
        mk('id_pais', 'id_pais', paisOpts, 'Seleccionar país...', {
            onChange: (v) => {
                this.solicitudSelects.id_estado.setValue('');
                this.solicitudSelects.id_estado.setOptions(
                    v ? optsFromList((cat.estado || []).filter(e => String(e.idPais) === String(v)), 'idEstado', e => e.nombre) : []
                );
                this.solicitudSelects.id_municipio.setValue('');
                this.solicitudSelects.id_municipio.setOptions([]);
                this.solicitudSelects.id_localidad.setValue('');
                this.solicitudSelects.id_localidad.setOptions([]);
            }
        });
        mk('id_estado', 'id_estado', [], 'Selecciona país primero...', {
            onChange: (v) => {
                this.solicitudSelects.id_municipio.setValue('');
                this.solicitudSelects.id_municipio.setOptions(
                    v ? optsFromList((cat.municipio || []).filter(m => String(m.idEstado) === String(v)), 'idMunicipio', m => m.nombre) : []
                );
                this.solicitudSelects.id_localidad.setValue('');
                this.solicitudSelects.id_localidad.setOptions([]);
            }
        });
        mk('id_municipio', 'id_municipio', [], 'Selecciona estado primero...', {
            onChange: (v) => {
                this.solicitudSelects.id_localidad.setValue('');
                this.solicitudSelects.id_localidad.setOptions(
                    v ? optsFromList((cat.localidad || []).filter(l => String(l.idMunicipio) === String(v)), 'idLocalidad', l => l.nombre) : []
                );
            }
        });
        mk('id_localidad', 'id_localidad', [], 'Selecciona municipio primero...');

        // Taxonomy cascade: Orden → Familia → Subfamilia → Tribu → Género → Especie
        mk('id_orden', 'id_orden', ordenOpts, 'Seleccionar orden...', {
            onChange: (v) => {
                this.solicitudSelects.id_familia.setValue('');
                this.solicitudSelects.id_familia.setOptions(
                    v ? optsFromList((cat.familia || []).filter(f => String(f.idOrden) === String(v)), 'idFamilia', f => f.nombre) : []
                );
                ['id_subfamilia', 'id_tribu', 'id_genero', 'id_especie'].forEach(k => {
                    this.solicitudSelects[k].setValue('');
                    this.solicitudSelects[k].setOptions([]);
                });
            }
        });
        mk('id_familia', 'id_familia', [], 'Selecciona orden primero...', {
            onChange: (v) => {
                this.solicitudSelects.id_subfamilia.setValue('');
                this.solicitudSelects.id_subfamilia.setOptions(
                    v ? optsFromList((cat.subfamilia || []).filter(s => String(s.idFamilia) === String(v)), 'idSubfamilia', s => s.nombre) : []
                );
                ['id_tribu', 'id_genero', 'id_especie'].forEach(k => {
                    this.solicitudSelects[k].setValue('');
                    this.solicitudSelects[k].setOptions([]);
                });
            }
        });
        mk('id_subfamilia', 'id_subfamilia', [], 'Selecciona familia primero...', {
            onChange: (v) => {
                this.solicitudSelects.id_tribu.setValue('');
                this.solicitudSelects.id_tribu.setOptions(
                    v ? optsFromList((cat.tribu || []).filter(t => String(t.idSubfamilia) === String(v)), 'idTribu', t => t.nombre) : []
                );
                ['id_genero', 'id_especie'].forEach(k => {
                    this.solicitudSelects[k].setValue('');
                    this.solicitudSelects[k].setOptions([]);
                });
            }
        });
        mk('id_tribu', 'id_tribu', [], 'Selecciona subfamilia primero...', {
            onChange: (v) => {
                this.solicitudSelects.id_genero.setValue('');
                this.solicitudSelects.id_genero.setOptions(
                    v ? optsFromList((cat.genero || []).filter(g => String(g.idTribu) === String(v)), 'idGenero', g => g.nombre) : []
                );
                this.solicitudSelects.id_especie.setValue('');
                this.solicitudSelects.id_especie.setOptions([]);
            }
        });
        mk('id_genero', 'id_genero', [], 'Selecciona tribu primero...', {
            onChange: (v) => {
                this.solicitudSelects.id_especie.setValue('');
                this.solicitudSelects.id_especie.setOptions(
                    v ? optsFromList((cat.especie || []).filter(e => String(e.idGenero) === String(v)), 'idEspecie',
                        e => e.nombre + (e.subespecie ? ` ${e.subespecie}` : '')) : []
                );
            }
        });
        mk('id_especie', 'id_especie', [], 'Selecciona género primero...');

        // Independent selects
        mk('id_tipo', 'id_tipo', tipoOpts, 'Seleccionar tipo...');
        mk('id_planta', 'id_planta', plantaOpts, 'Seleccionar planta hospedera...');
        mk('id_organismo_huesped', 'id_organismo_huesped', organismoOpts, 'Seleccionar organismo huésped...');
        mk('id_colector', 'id_colector', colectorOpts, 'Seleccionar colector...');
        mk('id_determinador', 'id_determinador', determinadorOpts, 'Seleccionar determinador...');
        mk('id_coleccion', 'id_coleccion', coleccionOpts, 'Seleccionar colección...');
        mk('id_cita', 'id_cita', citaOpts, 'Seleccionar cita...');
    }

    // ── Editar solicitud REGRESADA: pre-llenar formulario con datos previos ──
    initEditarSolicitudForm() {
        const form = this.container.querySelector('#editar-solicitud-form');
        if (!form) return;

        const sol = this.selectedSolicitudRegresada;

        // Mostrar comentario del revisor
        const bannerTxt = this.container.querySelector('#editar-sol-comentario-texto');
        if (bannerTxt) bannerTxt.textContent = sol?.ultimo_comentario || 'Sin comentarios del revisor.';

        // Subtítulo
        const subtitle = this.container.querySelector('#editar-sol-subtitle');
        if (subtitle && sol) subtitle.textContent = `Solicitud #${sol.id_solicitud}`;

        // Hidden field
        const hiddenId = this.container.querySelector('#editar-sol-id');
        if (hiddenId && sol) hiddenId.value = sol.id_solicitud;

        // Pre-llenar inputs simples con datos_propuestos
        const d = sol?.datos_propuestos || {};
        const setInput = (name, val) => {
            const el = form.elements[name];
            if (!el) return;
            if (el.type === 'date' && val) el.value = String(val).slice(0, 10);
            else el.value = (val == null ? '' : val);
        };
        setInput('nombre_comun', d.nombre_comun);
        setInput('nombre_cientifico', d.nombre_cientifico);
        setInput('num_individuos', d.num_individuos != null ? d.num_individuos : 1);
        setInput('fecha_colecta', d.fecha_colecta);
        setInput('anio_identificacion', d.anio_identificacion);
        setInput('anio_catalogacion', d.anio_catalogacion);
        setInput('numero_frasco', d.numero_frasco);
        setInput('envio_identificacion', d.envio_identificacion);
        setInput('latitud_n', d.latitud_n);
        setInput('longitud_o', d.longitud_o);
        setInput('altitud', d.altitud);
        setInput('datos_ecologicos', d.datos_ecologicos);

        // Destruir instancias previas
        Object.values(this.editarSolicitudSelects).forEach(s => { try { s.destroy(); } catch (e) {} });
        this.editarSolicitudSelects = {};

        const cat = this.model.catalogos;
        const optsFromList = (list, idKey, labelFn) =>
            (list || []).map(item => ({ value: String(item[idKey]), label: labelFn(item) }));

        const ordenOpts = optsFromList(cat.orden, 'idOrden', o => o.nombre);
        const tipoOpts = optsFromList(cat.tipo, 'idTipo', t => t.nombre);
        const paisOpts = optsFromList(cat.pais, 'idPais', p => p.nombre);
        const plantaOpts = optsFromList(cat.planta_hospedera, 'idPlanta', p => p.nombre_cientifico + (p.nombre_comun ? ` (${p.nombre_comun})` : ''));
        const organismoOpts = optsFromList(cat.organismo_hospedero, 'idOrganismo', o => o.nombre_organismo);
        const colectorOpts = optsFromList(cat.colector, 'idColector', c => `${c.nombre} ${c.apellido_paterno || ''}`.trim());
        const determinadorOpts = optsFromList(cat.determinador, 'idDeterminador', dd => `${dd.nombre} ${dd.apellido_paterno || ''}`.trim());
        const coleccionOpts = optsFromList(cat.coleccion, 'idColeccion', c => `${c.acronimo} — ${c.nombre_institucion || ''}`);
        const citaOpts = optsFromList(cat.cita, 'idCita', c => `${c.anio ? c.anio + ' — ' : ''}${c.titulo}`);

        const mk = (key, name, options, placeholder, value, extra = {}) => {
            const host = form.querySelector(`[data-cs-edit="${key}"]`);
            if (!host) return null;
            const sel = new CustomSelect(host, Object.assign({ options, value: value != null ? String(value) : '', placeholder, searchable: true, name }, extra));
            this.editarSolicitudSelects[key] = sel;
            return sel;
        };

        // Geo cascade
        mk('id_pais', 'id_pais', paisOpts, 'Seleccionar país...', d.id_pais, {
            onChange: (v) => {
                this.editarSolicitudSelects.id_estado.setValue('');
                this.editarSolicitudSelects.id_estado.setOptions(v ? optsFromList((cat.estado||[]).filter(e=>String(e.idPais)===String(v)),'idEstado',e=>e.nombre) : []);
                this.editarSolicitudSelects.id_municipio.setValue(''); this.editarSolicitudSelects.id_municipio.setOptions([]);
                this.editarSolicitudSelects.id_localidad.setValue(''); this.editarSolicitudSelects.id_localidad.setOptions([]);
            }
        });
        mk('id_estado', 'id_estado', d.id_pais ? optsFromList((cat.estado||[]).filter(e=>String(e.idPais)===String(d.id_pais)),'idEstado',e=>e.nombre) : [], 'Selecciona país primero...', d.id_estado, {
            onChange: (v) => {
                this.editarSolicitudSelects.id_municipio.setValue('');
                this.editarSolicitudSelects.id_municipio.setOptions(v ? optsFromList((cat.municipio||[]).filter(m=>String(m.idEstado)===String(v)),'idMunicipio',m=>m.nombre) : []);
                this.editarSolicitudSelects.id_localidad.setValue(''); this.editarSolicitudSelects.id_localidad.setOptions([]);
            }
        });
        mk('id_municipio', 'id_municipio', d.id_estado ? optsFromList((cat.municipio||[]).filter(m=>String(m.idEstado)===String(d.id_estado)),'idMunicipio',m=>m.nombre) : [], 'Selecciona estado primero...', d.id_municipio, {
            onChange: (v) => {
                this.editarSolicitudSelects.id_localidad.setValue('');
                this.editarSolicitudSelects.id_localidad.setOptions(v ? optsFromList((cat.localidad||[]).filter(l=>String(l.idMunicipio)===String(v)),'idLocalidad',l=>l.nombre) : []);
            }
        });
        mk('id_localidad', 'id_localidad', d.id_municipio ? optsFromList((cat.localidad||[]).filter(l=>String(l.idMunicipio)===String(d.id_municipio)),'idLocalidad',l=>l.nombre) : [], 'Selecciona municipio primero...', d.id_localidad);

        // Taxonomy cascade
        mk('id_orden', 'id_orden', ordenOpts, 'Seleccionar orden...', d.id_orden, {
            onChange: (v) => {
                this.editarSolicitudSelects.id_familia.setValue('');
                this.editarSolicitudSelects.id_familia.setOptions(v ? optsFromList((cat.familia||[]).filter(f=>String(f.idOrden)===String(v)),'idFamilia',f=>f.nombre) : []);
                ['id_subfamilia','id_tribu','id_genero','id_especie'].forEach(k=>{ this.editarSolicitudSelects[k].setValue(''); this.editarSolicitudSelects[k].setOptions([]); });
            }
        });
        mk('id_familia', 'id_familia', d.id_orden ? optsFromList((cat.familia||[]).filter(f=>String(f.idOrden)===String(d.id_orden)),'idFamilia',f=>f.nombre) : [], 'Selecciona orden primero...', d.id_familia, {
            onChange: (v) => {
                this.editarSolicitudSelects.id_subfamilia.setValue('');
                this.editarSolicitudSelects.id_subfamilia.setOptions(v ? optsFromList((cat.subfamilia||[]).filter(s=>String(s.idFamilia)===String(v)),'idSubfamilia',s=>s.nombre) : []);
                ['id_tribu','id_genero','id_especie'].forEach(k=>{ this.editarSolicitudSelects[k].setValue(''); this.editarSolicitudSelects[k].setOptions([]); });
            }
        });
        mk('id_subfamilia','id_subfamilia', d.id_familia ? optsFromList((cat.subfamilia||[]).filter(s=>String(s.idFamilia)===String(d.id_familia)),'idSubfamilia',s=>s.nombre) : [], 'Selecciona familia primero...', d.id_subfamilia, {
            onChange: (v) => {
                this.editarSolicitudSelects.id_tribu.setValue('');
                this.editarSolicitudSelects.id_tribu.setOptions(v ? optsFromList((cat.tribu||[]).filter(t=>String(t.idSubfamilia)===String(v)),'idTribu',t=>t.nombre) : []);
                ['id_genero','id_especie'].forEach(k=>{ this.editarSolicitudSelects[k].setValue(''); this.editarSolicitudSelects[k].setOptions([]); });
            }
        });
        mk('id_tribu','id_tribu', d.id_subfamilia ? optsFromList((cat.tribu||[]).filter(t=>String(t.idSubfamilia)===String(d.id_subfamilia)),'idTribu',t=>t.nombre) : [], 'Selecciona subfamilia primero...', d.id_tribu, {
            onChange: (v) => {
                this.editarSolicitudSelects.id_genero.setValue('');
                this.editarSolicitudSelects.id_genero.setOptions(v ? optsFromList((cat.genero||[]).filter(g=>String(g.idTribu)===String(v)),'idGenero',g=>g.nombre) : []);
                this.editarSolicitudSelects.id_especie.setValue(''); this.editarSolicitudSelects.id_especie.setOptions([]);
            }
        });
        mk('id_genero','id_genero', d.id_tribu ? optsFromList((cat.genero||[]).filter(g=>String(g.idTribu)===String(d.id_tribu)),'idGenero',g=>g.nombre) : [], 'Selecciona tribu primero...', d.id_genero, {
            onChange: (v) => {
                this.editarSolicitudSelects.id_especie.setValue('');
                this.editarSolicitudSelects.id_especie.setOptions(v ? optsFromList((cat.especie||[]).filter(e=>String(e.idGenero)===String(v)),'idEspecie',e=>e.nombre+(e.subespecie?` ${e.subespecie}`:'')) : []);
            }
        });
        mk('id_especie','id_especie', d.id_genero ? optsFromList((cat.especie||[]).filter(e=>String(e.idGenero)===String(d.id_genero)),'idEspecie',e=>e.nombre+(e.subespecie?` ${e.subespecie}`:'')) : [], 'Selecciona género primero...', d.id_especie);

        mk('id_tipo','id_tipo', tipoOpts, 'Seleccionar tipo...', d.id_tipo);
        mk('id_planta','id_planta', plantaOpts, 'Seleccionar planta hospedera...', d.id_planta);
        mk('id_organismo_huesped','id_organismo_huesped', organismoOpts, 'Seleccionar organismo huésped...', d.id_organismo_huesped);
        mk('id_colector','id_colector', colectorOpts, 'Seleccionar colector...', d.id_colector);
        mk('id_determinador','id_determinador', determinadorOpts, 'Seleccionar determinador...', d.id_determinador);
        mk('id_coleccion','id_coleccion', coleccionOpts, 'Seleccionar colección...', d.id_coleccion);
        mk('id_cita','id_cita', citaOpts, 'Seleccionar cita...', d.id_cita);
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

        // Verificar si hay alguna REGRESADA para mostrar/ocultar btn-editar-solicitud
        const regresadas = rows.filter(r => r.estado === 'REGRESADA');
        const btnEditarSol = this.container.querySelector('#btn-editar-solicitud');
        if (btnEditarSol && !this.isAdmin) {
            if (regresadas.length > 0) {
                this.selectedSolicitudRegresada = regresadas[0]; // la más reciente
                btnEditarSol.style.display = 'flex';
            } else {
                this.selectedSolicitudRegresada = null;
                btnEditarSol.style.display = 'none';
            }
        }

        if (!rows.length) {
            box.innerHTML = '<p style="margin:0;color:var(--text-muted);">No hay solicitudes registradas.</p>';
            return;
        }

        const statusColors = {
            'PENDIENTE':  { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6' },
            'APROBADA':   { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
            'RECHAZADA':  { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
            'REGRESADA':  { bg: 'rgba(251,191,36,0.1)',  color: '#f59e0b' },
        };

        box.innerHTML = rows.map((r) => {
            const fc = r.fecha_creacion ? String(r.fecha_creacion).replace('T', ' ').slice(0, 19) : '';
            const sc = statusColors[r.estado] || { bg: 'rgba(128,128,128,0.1)', color: '#888' };
            const badge = `<span style="background:${sc.bg};color:${sc.color};padding:2px 8px;border-radius:4px;font-size:0.72rem;font-weight:700;">${r.estado || ''}</span>`;
            let comentario = '';
            if (r.estado === 'REGRESADA' && r.ultimo_comentario) {
                comentario = `<div style="margin-top:0.35rem;font-size:0.8rem;color:#f59e0b;background:rgba(251,191,36,0.08);padding:0.35rem 0.6rem;border-radius:6px;border-left:3px solid #f59e0b;">
                    <strong>Comentario:</strong> ${r.ultimo_comentario}</div>`;
            }
            return `<div style="padding:0.6rem 0;border-bottom:1px solid var(--border-color);">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="display:flex;align-items:center;gap:0.5rem;">#${r.id_solicitud} ${badge}</span>
                    <span style="font-size:0.8rem;color:var(--text-muted);">${fc}</span>
                </div>
                ${comentario}
            </div>`;
        }).join('');
    }

    async handleAltaSubmit(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = {};
        fd.forEach((value, key) => {
            data[key] = (typeof value === 'string' && value.trim() === '') ? null : value;
        });
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
            window.Utils.showToast('No se pudo obtener el usuario.', 'danger');
            return;
        }
        try {
            const datos = this.datosPropuestosDesdeFormulario(new FormData(e.target));
            if (!datos.nombre_cientifico || String(datos.nombre_cientifico).trim() === '') {
                window.Utils.showToast('El nombre científico es obligatorio en la solicitud.', 'warning');
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

    async handleEditarSolicitudSubmit(e) {
        e.preventDefault();
        const uid = this.getUserId();
        if (!uid) { window.Utils.showToast('No se pudo obtener el usuario.', 'danger'); return; }
        if (!this.selectedSolicitudRegresada) { window.Utils.showToast('No hay solicitud seleccionada para editar.', 'warning'); return; }
        try {
            const datos = this.datosPropuestosDesdeFormulario(new FormData(e.target));
            if (!datos.nombre_cientifico || String(datos.nombre_cientifico).trim() === '') {
                window.Utils.showToast('El nombre científico es obligatorio.', 'warning');
                return;
            }
            await this.model.updateSolicitud(this.selectedSolicitudRegresada.id_solicitud, uid, datos);
            e.target.reset();
            this.selectedSolicitudRegresada = null;
            await this.refreshMisSolicitudes();
            this.navigate('general');
            window.Utils.showToast('Solicitud reenviada correctamente. El administrador la revisará en Aprobaciones.', 'success');
        } catch (err) {
            window.Utils.showToast(err.message || 'Error al reenviar la solicitud', 'danger');
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
