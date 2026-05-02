class CatalogoController {
    constructor() {
        this.model = window.CatalogoModel;
        this.currentView = 'dashboard';
        this.currentSection = null;
        this.selectedItem = null;
        this.query = '';
    }

    async init() {
        this.container = document.getElementById('catalogos-module');
        if (!this.container) return;

        this.bindEvents();
        this.render();
        if (window.CatalogosTutorial) window.CatalogosTutorial.init();
    }

    bindEvents() {
        // Navigation events
        document.getElementById('breadcrumb-catalogos')?.addEventListener('click', () => this.navigate('dashboard'));
        document.getElementById('breadcrumb-section')?.addEventListener('click', () => this.navigate('general'));
        
        document.getElementById('btn-alta-catalogo')?.addEventListener('click', () => this.navigate('alta'));
        document.getElementById('btn-actualizar-catalogo')?.addEventListener('click', () => {
            if (!this.selectedItem) { alert('Seleccione un registro de la tabla primero.'); return; }
            this.navigate('modificar', this.selectedItem);
        });
        document.getElementById('btn-eliminar-catalogo')?.addEventListener('click', () => {
            if (!this.selectedItem) { alert('Seleccione un registro de la tabla primero.'); return; }
            this.navigate('baja', this.selectedItem);
        });

        document.querySelectorAll('.btn-back-general').forEach(btn => {
            btn.addEventListener('click', () => this.navigate('general'));
        });

        // Search
        const searchInput = document.getElementById('search-catalogos-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.query = e.target.value;
                this.renderTable();
            });
        }

        // Forms
        document.getElementById('alta-catalogo-form')?.addEventListener('submit', (e) => this.handleAltaSubmit(e));
        document.getElementById('modificar-catalogo-form')?.addEventListener('submit', (e) => this.handleModificarSubmit(e));
        document.getElementById('btn-confirmar-baja-cat')?.addEventListener('click', () => this.handleBajaSubmit());
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
        } else if (this.currentView === 'modificar') {
            document.getElementById('cat-title-modificar').textContent = `Actualizar ${this.getSectionLabel()}`;
            this.renderForm('modificar-catalogo-form', 'modificar');
        } else if (this.currentView === 'baja') {
            this.renderBaja();
        }

        lucide.createIcons();
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

        cols.push({ label: 'Estado', key: 'status' });

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
        fieldsContainer.innerHTML = ''; // Clear

        const s = this.currentSection;
        let html = '';

        const makeInput = (label, name, required = false, type = 'text', ph = '') => `
            <div class="form-group">
                <label>${label} ${required ? '*' : ''}</label>
                <input type="${type}" name="${name}" ${required ? 'required' : ''} placeholder="${ph}">
            </div>`;

        const parentSec = this.model.PARENT_SECTION[s];
        if (parentSec) {
            let parentIdKey = parentSec === 'organismo' ? 'idOrganismo' : 'id' + parentSec.charAt(0).toUpperCase() + parentSec.slice(1);
            let options = this.model.parentItems.map(p => `<option value="${p[parentIdKey]}">${p.nombre || p.nombre_cientifico || p.nombre_organismo || p.acronimo || p[parentIdKey]}</option>`).join('');
            html += `
            <div class="form-group">
                <label>Padre (${parentSec}) *</label>
                <select name="${parentIdKey}" required>
                    <option value="">Seleccione...</option>
                    ${options}
                </select>
            </div>`;
        }

        if (['pais', 'estado', 'municipio', 'localidad', 'orden', 'familia', 'subfamilia', 'tribu', 'genero', 'especie', 'tipo'].includes(s)) {
            html += makeInput('Nombre', 'nombre', true);
            if (s === 'pais') html += makeInput('Código ISO', 'codigo', false);
            if (s === 'localidad') html += makeInput('Latitud', 'latitud', false) + makeInput('Longitud', 'longitud', false) + makeInput('Altitud', 'altitud', false);
            if (s === 'especie') html += makeInput('Subespecie', 'subespecie', false);
        } else if (['colector', 'determinador'].includes(s)) {
            html += makeInput('Nombre(s)', 'nombre', true);
            html += makeInput('Apellido Paterno', 'apellido_paterno', false);
            html += makeInput('Apellido Materno', 'apellido_materno', false);
            html += makeInput('Correo', 'correo', false, 'email');
            html += makeInput('Institución', 'institucion', false);
        } else if (s === 'planta') {
            html += makeInput('Familia Botánica', 'familia_botanica', false);
            html += makeInput('Nombre Científico', 'nombre_cientifico', true);
            html += makeInput('Nombre Común', 'nombre_comun', false);
        } else if (s === 'organismo') {
            html += makeInput('Familia Hospedera', 'familia_hospedera', false);
            html += makeInput('Nombre Organismo', 'nombre_organismo', true);
        } else if (s === 'coleccion') {
            html += makeInput('Acrónimo', 'acronimo', true);
            html += makeInput('Nombre Institución', 'nombre_institucion', false);
        } else if (s === 'cita') {
            html += makeInput('Título', 'titulo', true);
            html += makeInput('Autores', 'autores', false);
            html += makeInput('Año', 'anio', false, 'number');
            html += makeInput('Revista', 'revista', false);
            html += makeInput('Volumen', 'volumen', false);
            html += makeInput('Páginas', 'paginas', false);
            html += `<div class="form-group"><label>Referencia Completa</label><textarea name="referencia_completa"></textarea></div>`;
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
            alert('Error creando el registro');
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
            alert('Error actualizando el registro');
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
            alert('Error eliminando el registro');
        }
    }
}

window.CatalogoController = new CatalogoController();
