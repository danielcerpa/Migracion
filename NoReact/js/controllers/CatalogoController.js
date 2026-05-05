class CatalogoController {
    constructor() {
        this.model = window.CatalogoModel;
        this.currentView = 'dashboard';
        this.currentSection = null;
        this.selectedItem = null;
        this.query = '';
        this._uiAbort = null;
    }

    async init() {
        this.container = document.getElementById('catalogos-module');
        if (!this.container) return;

        // Resetear estado al recargar desde sidebar
        this.currentView = 'dashboard';
        this.currentSection = null;
        this.selectedItem = null;
        this.query = '';

        if (this._uiAbort) this._uiAbort.abort();
        this._uiAbort = new AbortController();

        this.bindEvents();
        this.render();
        if (window.CatalogosTutorial) window.CatalogosTutorial.init();
    }

    bindEvents() {
        const { signal } = this._uiAbort;

        // Navigation events
        document.getElementById('breadcrumb-catalogos')?.addEventListener('click', () => this.navigate('dashboard'), { signal });
        document.getElementById('breadcrumb-section')?.addEventListener('click', () => this.navigate('general'), { signal });
        
        document.getElementById('btn-alta-catalogo')?.addEventListener('click', () => this.navigate('alta'), { signal });
        document.getElementById('btn-actualizar-catalogo')?.addEventListener('click', () => {
            if (!this.selectedItem) { window.Utils.showToast('Seleccione un registro de la tabla primero.', 'warning'); return; }
            this.navigate('modificar', this.selectedItem);
        }, { signal });
        document.getElementById('btn-eliminar-catalogo')?.addEventListener('click', () => {
            if (!this.selectedItem) { window.Utils.showToast('Seleccione un registro de la tabla primero.', 'warning'); return; }
            this.navigate('baja', this.selectedItem);
        }, { signal });

        document.querySelectorAll('.btn-back-general').forEach(btn => {
            btn.addEventListener('click', () => this.navigate('general'), { signal });
        });

        // Search
        const searchInput = document.getElementById('search-catalogos-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.query = e.target.value;
                this.renderTable();
                const clearBtn = document.getElementById('btn-clear-search-cat');
                if (clearBtn) clearBtn.style.visibility = this.query ? 'visible' : 'hidden';
            }, { signal });
        }
        document.getElementById('btn-clear-search-cat')?.addEventListener('click', (e) => {
            this.query = '';
            if (searchInput) searchInput.value = '';
            this.renderTable();
            e.currentTarget.style.visibility = 'hidden';
        }, { signal });

        // Forms
        document.getElementById('alta-catalogo-form')?.addEventListener('submit', (e) => this.handleAltaSubmit(e), { signal });
        document.getElementById('modificar-catalogo-form')?.addEventListener('submit', (e) => this.handleModificarSubmit(e), { signal });
        document.getElementById('btn-confirmar-baja-cat')?.addEventListener('click', () => this.handleBajaSubmit(), { signal });
    }

    async selectSection(section) {
        this.currentSection = section;
        this.selectedItem = null;
        this.query = '';
        await this.model.fetchData(section, false);
        this.navigate('general');
    }

    async navigate(view, item = null) {
        if (item) this.selectedItem = item;
        else if (view === 'alta') this.selectedItem = null;

        if (view === 'alta' || view === 'modificar') {
            await this.model.fetchData(this.currentSection, true); // Load parent items if needed
        }

        this.currentView = view;
        this.render();
    }

    getSectionLabel() {
        const labels = {
            pais: 'País', estado: 'Estado', municipio: 'Municipio', localidad: 'Localidad',
            orden: 'Orden', familia: 'Familia', subfamilia: 'Subfamilia', tribu: 'Tribu',
            genero: 'Género', especie: 'Especie', tipo: 'Tipo', colector: 'Colector',
            determinador: 'Determinador', planta: 'Planta', organismo: 'Organismo',
            coleccion: 'Colección', cita: 'Cita Bib.'
        };
        return labels[this.currentSection] || '';
    }

    getIdKey() {
        if (this.currentSection === 'organismo') return 'idOrganismo';
        return 'id' + this.currentSection.charAt(0).toUpperCase() + this.currentSection.slice(1);
    }

    render() {
        const views = ['dashboard', 'general', 'alta', 'modificar', 'baja'];
        views.forEach(v => {
            const el = document.getElementById(`view-cat-${v}`);
            if (el) el.style.display = v === this.currentView ? 'block' : 'none';
        });

        // Breadcrumbs
        const breadcrumb = document.getElementById('catalogos-breadcrumb');
        const crumbSection = document.getElementById('breadcrumb-section');
        const crumbCurrent = document.getElementById('current-crumb-cat');
        const sep = document.getElementById('crumb-sep');

        if (this.currentView === 'dashboard') {
            if (breadcrumb) breadcrumb.style.display = 'none';
        } else {
            if (breadcrumb) breadcrumb.style.display = 'flex';
            if (crumbSection) crumbSection.textContent = this.getSectionLabel();
            
            if (this.currentView === 'general') {
                if (crumbCurrent) crumbCurrent.style.display = 'none';
                if (sep) sep.style.display = 'none';
            } else {
                if (crumbCurrent) {
                    crumbCurrent.style.display = 'inline';
                    let label = this.currentView;
                    if (label === 'modificar') label = 'Actualizar';
                    crumbCurrent.textContent = label.charAt(0).toUpperCase() + label.slice(1);
                }
                if (sep) sep.style.display = 'inline';
            }
        }

        if (this.currentView === 'general') {
            document.getElementById('cat-title-general').innerHTML = `Gestión de ${this.getSectionLabel()}`;
            this.renderTable();
            if (window.CatalogosTutorial) window.CatalogosTutorial.init();
        } else if (this.currentView === 'alta') {
            document.getElementById('cat-title-alta').textContent = `Nuevo ${this.getSectionLabel()}`;
            this.renderForm('alta-catalogo-form', 'alta');
            this.renderSideTable('alta');
        } else if (this.currentView === 'modificar') {
            document.getElementById('cat-title-modificar').textContent = `Actualizar ${this.getSectionLabel()}`;
            this.renderForm('modificar-catalogo-form', 'modificar');
            this.renderSideTable('modificar');
        } else if (this.currentView === 'baja') {
            this.renderBaja();
        }

        this.applyPermissions();
        lucide.createIcons();
    }

    applyPermissions() {
        const canAdd = window.Utils.checkPermission('Catalogos', 'add');
        const canEdit = window.Utils.checkPermission('Catalogos', 'edit');
        const canDelete = window.Utils.checkPermission('Catalogos', 'delete');

        const btnAlta = document.getElementById('btn-alta-catalogo');
        const btnEdit = document.getElementById('btn-actualizar-catalogo');
        const btnDelete = document.getElementById('btn-eliminar-catalogo');

        if (btnAlta) btnAlta.style.display = canAdd ? 'flex' : 'none';
        if (btnEdit) btnEdit.style.display = canEdit ? 'flex' : 'none';
        if (btnDelete) btnDelete.style.display = canDelete ? 'flex' : 'none';
    }

    renderTable() {
        const thead = document.getElementById('cat-table-head');
        const tbody = document.getElementById('cat-table-body');
        if (!thead || !tbody) return;

        const idKey = this.getIdKey();
        
        let cols = [{ label: 'ID', key: idKey }];
        if (this.currentSection === 'pais') cols.push({ label: 'Nombre', key: 'nombre' }, { label: 'ISO', key: 'codigo' });
        else if (this.currentSection === 'cita') cols.push({ label: 'Título', key: 'titulo' }, { label: 'Año', key: 'anio' });
        else if (this.currentSection === 'planta') cols.push({ label: 'Nombre Científico', key: 'nombre_cientifico' }, { label: 'Nombre Común', key: 'nombre_comun' });
        else if (this.currentSection === 'organismo') cols.push({ label: 'Nombre', key: 'nombre_organismo' }, { label: 'Familia Hosp.', key: 'familia_hospedera' });
        else if (this.currentSection === 'coleccion') cols.push({ label: 'Acrónimo', key: 'acronimo' }, { label: 'Institución', key: 'nombre_institucion' });
        else if (this.currentSection === 'especie') cols.push({ label: 'Nombre', key: 'nombre' }, { label: 'Subespecie', key: 'subespecie' });
        else cols.push({ label: 'Nombre', key: 'nombre' });

        if (['estado', 'municipio', 'localidad'].includes(this.currentSection)) {
            cols.push({ label: 'País', key: 'nombrePais' });
        } else {
            cols.push({ label: 'Estado', key: 'status' });
        }

        thead.innerHTML = `<tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr>`;

        let filtered = this.model.items;
        if (this.query.trim() !== '') {
            const q = this.query.toLowerCase();
            filtered = filtered.filter(item => 
                Object.values(item).some(val => String(val).toLowerCase().includes(q))
            );
        }

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${cols.length}" class="td-empty">No se encontraron registros.</td></tr>`;
        } else {
            filtered.forEach(item => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                if (this.selectedItem && this.selectedItem[idKey] === item[idKey]) {
                    tr.style.backgroundColor = 'var(--bg-hover)';
                }
                tr.onclick = () => {
                    this.selectedItem = item;
                    this.renderTable();
                };

                tr.innerHTML = cols.map(c => {
                    if (c.key === 'status') {
                        const s = item[c.key] == 1 ? 'activo' : 'inactivo';
                        return `<td><span class="status-badge ${s}">${s}</span></td>`;
                    }
                    return `<td>${item[c.key] || '-'}</td>`;
                }).join('');
                
                tbody.appendChild(tr);
            });
        }
    }

    renderForm(formId, mode) {
        const form = document.getElementById(formId);
        const fieldsContainer = form.querySelector('.dynamic-fields');
        fieldsContainer.innerHTML = '';

        const s = this.currentSection;
        let html = '';

        // Secciones con muchos campos usan 2 columnas
        const multiColSections = ['colector', 'determinador', 'cita', 'localidad', 'planta', 'organismo', 'coleccion'];
        const gridCols = multiColSections.includes(s) ? '1fr 1fr' : '1fr';
        fieldsContainer.style.gridTemplateColumns = gridCols;

        const makeCol = (label, inner) => `<div class="form-group"><label>${label}</label>${inner}</div>`;
        const makeColFull = (label, inner) => `<div class="form-group cat-full-width"><label>${label}</label>${inner}</div>`;
        const req = `<span class="cat-required">*</span>`;

        const inp = (name, type = 'text', ph = '', required = false) =>
            `<input type="${type}" name="${name}" class="form-control" ${required ? 'required' : ''} placeholder="${ph}">`;
        const sel = (name, options, required = false) =>
            `<select name="${name}" class="form-select custom-select-vanilla" ${required ? 'required' : ''}><option value="">Seleccione...</option>${options}</select>`;
        const ta = (name, ph = '') =>
            `<textarea name="${name}" class="form-control" rows="3" placeholder="${ph}" style="resize:vertical;"></textarea>`;

        const parentSec = this.model.PARENT_SECTION[s];
        if (parentSec) {
            const parentIdKey = parentSec === 'organismo' ? 'idOrganismo' : 'id' + parentSec.charAt(0).toUpperCase() + parentSec.slice(1);
            const options = this.model.parentItems.map(p => `<option value="${p[parentIdKey]}">${p.nombre || p.nombre_cientifico || p.nombre_organismo || p.acronimo || p[parentIdKey]}</option>`).join('');
            html += makeColFull(`Padre (${parentSec}) ${req}`, sel(parentIdKey, options, true));
        }

        if (['pais', 'estado', 'municipio', 'localidad', 'orden', 'familia', 'subfamilia', 'tribu', 'genero', 'especie', 'tipo'].includes(s)) {
            html += makeCol(`Nombre ${req}`, inp('nombre', 'text', `Ej. ${s.charAt(0).toUpperCase() + s.slice(1)}`, true));
            if (s === 'pais') html += makeCol('Código ISO', inp('codigo', 'text', 'Ej. MX'));
            if (s === 'localidad') {
                html += makeCol('Latitud', inp('latitud', 'text', 'Ej. 19.4326'));
                html += makeCol('Longitud', inp('longitud', 'text', 'Ej. -99.1332'));
                html += makeColFull('Altitud (m)', inp('altitud', 'number', 'Ej. 2240'));
            }
            if (s === 'especie') html += makeCol('Subespecie', inp('subespecie', 'text', 'Opcional'));
        } else if (['colector', 'determinador'].includes(s)) {
            html += makeCol(`Nombre(s) ${req}`, inp('nombre', 'text', 'Ej. Juan', true));
            html += makeCol('Apellido Paterno', inp('apellido_paterno', 'text', 'Ej. Pérez'));
            html += makeCol('Apellido Materno', inp('apellido_materno', 'text', 'Ej. García'));
            html += makeCol('Correo Electrónico', inp('correo', 'email', 'usuario@mail.com'));
            html += makeColFull('Institución', inp('institucion', 'text', 'Ej. UNAM'));
        } else if (s === 'planta') {
            html += makeCol('Familia Botánica', inp('familia_botanica', 'text', 'Ej. Asteraceae'));
            html += makeCol(`Nombre Científico ${req}`, inp('nombre_cientifico', 'text', 'Ej. Dahlia pinnata', true));
            html += makeColFull('Nombre Común', inp('nombre_comun', 'text', 'Ej. Dalia'));
        } else if (s === 'organismo') {
            html += makeCol('Familia Hospedera', inp('familia_hospedera', 'text', 'Ej. Formicidae'));
            html += makeCol(`Nombre Organismo ${req}`, inp('nombre_organismo', 'text', 'Ej. Hormiga roja', true));
        } else if (s === 'coleccion') {
            html += makeCol(`Acrónimo ${req}`, inp('acronimo', 'text', 'Ej. UNAM-EC', true));
            html += makeCol('Nombre de la Institución', inp('nombre_institucion', 'text', 'Ej. Universidad Nacional...'));
        } else if (s === 'cita') {
            html += makeColFull(`Título ${req}`, inp('titulo', 'text', 'Ej. Taxonomía de los Lepidópteros', true));
            html += makeColFull('Autores', inp('autores', 'text', 'Ej. García, J.; López, R.'));
            html += makeCol('Revista / Publicación', inp('revista', 'text', 'Ej. Revista Mexicana de Biodiversidad'));
            html += makeCol('Año', inp('anio', 'number', 'Ej. 2023'));
            html += makeCol('Volumen', inp('volumen', 'text', 'Ej. 12(3)'));
            html += makeCol('Páginas', inp('paginas', 'text', 'Ej. 45-67'));
            html += makeColFull('Referencia Completa', ta('referencia_completa', 'Cita bibliográfica completa...'));
        }

        fieldsContainer.innerHTML = html;

        if (mode === 'modificar' && this.selectedItem) {
            Array.from(form.elements).forEach(el => {
                if (el.name && this.selectedItem[el.name] !== undefined) {
                    el.value = this.selectedItem[el.name];
                }
            });
        } else {
            form.reset();
        }
    }

    renderBaja() {
        if (!this.selectedItem) return;
        const name = this.selectedItem.nombre || this.selectedItem.nombre_cientifico || this.selectedItem.nombre_organismo || this.selectedItem.titulo || this.selectedItem.acronimo;
        document.getElementById('baja-cat-name').textContent = name;
    }

    async handleAltaSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await this.model.createItem(this.currentSection, data);
            await this.model.fetchData(this.currentSection, false);
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error creando el registro', 'danger');
        }
    }

    async handleModificarSubmit(e) {
        e.preventDefault();
        if (!this.selectedItem) return;
        const idKey = this.getIdKey();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await this.model.updateItem(this.currentSection, this.selectedItem[idKey], data);
            await this.model.fetchData(this.currentSection, false);
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error actualizando el registro', 'danger');
        }
    }

    async handleBajaSubmit() {
        if (!this.selectedItem) return;
        const idKey = this.getIdKey();
        try {
            await this.model.deleteItem(this.currentSection, this.selectedItem[idKey]);
            await this.model.fetchData(this.currentSection, false);
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error eliminando el registro', 'danger');
        }
    }
    renderSideTable(view) {
        const cardId = `${view}-side-table-card`;
        const card = document.getElementById(cardId);
        if (!card) return;

        if (this.currentSection !== 'pais' && this.currentSection !== 'orden') {
            card.style.display = 'none';
            return;
        }

        card.style.display = 'block';
        const titleEl = document.getElementById(`${view}-side-table-title`);
        if (titleEl) {
            let label = this.getSectionLabel().toUpperCase();
            if (label === 'PAÍS') label = 'PAÍSES';
            else if (label === 'ORDEN') label = 'ÓRDENES';
            titleEl.textContent = `${label} REGISTRADOS`;
        }
        
        const thead = document.getElementById(`${view}-side-table-head`);
        const tbody = document.getElementById(`${view}-side-table-body`);
        const searchInput = document.getElementById(`search-side-${view}-input`);
        
        if (searchInput && !searchInput.dataset.bound) {
            searchInput.dataset.bound = "true";
            searchInput.addEventListener('input', (e) => {
                this[`sideQuery_${view}`] = e.target.value.toLowerCase();
                this.renderSideTable(view);
            }, { signal: this._uiAbort?.signal });
        }

        const q = this[`sideQuery_${view}`] || '';
        
        let cols = [];
        if (this.currentSection === 'pais') {
            cols = [{ label: 'NOMBRE', key: 'nombre' }, { label: 'ISO', key: 'codigo' }];
        } else if (this.currentSection === 'orden') {
            cols = [{ label: 'NOMBRE', key: 'nombre' }];
        }

        thead.innerHTML = `<tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr>`;

        let filtered = this.model.items.filter(item => item.status == 1);
        if (q.trim() !== '') {
            filtered = filtered.filter(item => 
                Object.values(item).some(val => String(val).toLowerCase().includes(q))
            );
        }

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${cols.length}" style="text-align:center; padding: 1rem; color: var(--text-muted);">No hay registros.</td></tr>`;
        } else {
            filtered.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = cols.map(c => `<td>${item[c.key] || '-'}</td>`).join('');
                tbody.appendChild(tr);
            });
        }
        
        const tableCard = card.querySelector('.table-card');
        if (tableCard) {
            tableCard.style.maxHeight = '400px';
            tableCard.style.overflowY = 'auto';
        }
    }
}

window.CatalogoController = new CatalogoController();
