class FototecaController {
    constructor() {
        this.model = window.FototecaModel;
        this.currentView = 'general';
        this.selectedItem = null;
        this.query = '';
        this._uiAbort = null;
    }

    async init() {
        this.container = document.getElementById('fototeca-module');
        if (!this.container) return;

        await this.model.fetchFotos();

        if (this._uiAbort) this._uiAbort.abort();
        this._uiAbort = new AbortController();
        
        this.bindEvents();
        this.render();
        if (window.FototecaTutorial) window.FototecaTutorial.init();
    }

    bindEvents() {
        const { signal } = this._uiAbort;

        document.getElementById('btn-alta-fototeca')?.addEventListener('click', () => this.navigate('alta'), { signal });
        document.getElementById('btn-actualizar-fototeca')?.addEventListener('click', () => {
            if (!this.selectedItem) { alert('Seleccione una imagen primero.'); return; }
            this.navigate('modificar', this.selectedItem);
        }, { signal });
        document.getElementById('btn-eliminar-fototeca')?.addEventListener('click', () => {
            if (!this.selectedItem) { alert('Seleccione una imagen primero.'); return; }
            this.navigate('baja', this.selectedItem);
        }, { signal });

        document.querySelectorAll('.btn-back-general').forEach(btn => {
            btn.addEventListener('click', () => this.navigate('general'), { signal });
        });
        document.getElementById('breadcrumb-back')?.addEventListener('click', () => this.navigate('general'), { signal });

        const searchInput = document.getElementById('search-fototeca-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.query = e.target.value;
                this.renderTable();
            }, { signal });
        }
        
        document.getElementById('alta-fototeca-form')?.addEventListener('submit', (e) => this.handleAltaSubmit(e), { signal });
        document.getElementById('modificar-fototeca-form')?.addEventListener('submit', (e) => this.handleModificarSubmit(e), { signal });
        document.getElementById('btn-confirmar-baja-foto')?.addEventListener('click', () => this.handleBajaSubmit(), { signal });
    }

    navigate(view, item = null) {
        if (item) this.selectedItem = item;
        else if (view === 'alta') this.selectedItem = null;

        this.currentView = view;
        this.render();
    }

    render() {
        const views = ['general', 'alta', 'modificar', 'baja'];
        views.forEach(v => {
            const el = document.getElementById(`view-foto-${v}`);
            if (el) el.style.display = v === this.currentView ? 'block' : 'none';
        });

        const breadcrumb = document.getElementById('fototeca-breadcrumb');
        const currentCrumb = document.getElementById('current-crumb');
        if (breadcrumb && currentCrumb) {
            if (this.currentView === 'general') {
                breadcrumb.style.display = 'none';
            } else {
                breadcrumb.style.display = 'flex';
                let label = this.currentView;
                if (label === 'modificar') label = 'Actualizar';
                currentCrumb.textContent = label.charAt(0).toUpperCase() + label.slice(1);
            }
        }

        if (this.currentView === 'general') {
            this.renderTable();
        } else if (this.currentView === 'alta') {
            document.getElementById('alta-fototeca-form').reset();
        } else if (this.currentView === 'modificar') {
            this.renderModificarForm();
        } else if (this.currentView === 'baja') {
            this.renderBajaForm();
        }

        this.applyPermissions();
        lucide.createIcons();
    }

    applyPermissions() {
        const canAdd = window.Utils.checkPermission('Fototeca', 'add');
        const canEdit = window.Utils.checkPermission('Fototeca', 'edit');
        const canDelete = window.Utils.checkPermission('Fototeca', 'delete');

        const btnAlta = document.getElementById('btn-alta-fototeca');
        const btnEdit = document.getElementById('btn-actualizar-fototeca');
        const btnDelete = document.getElementById('btn-eliminar-fototeca');

        if (btnAlta) btnAlta.style.display = canAdd ? 'flex' : 'none';
        if (btnEdit) btnEdit.style.display = canEdit ? 'flex' : 'none';
        if (btnDelete) btnDelete.style.display = canDelete ? 'flex' : 'none';
    }

    renderTable() {
        const tbody = document.getElementById('fototeca-table-body');
        if (!tbody) return;

        let filtered = this.model.items;
        if (this.query.trim() !== '') {
            const q = this.query.toLowerCase();
            filtered = filtered.filter(item => 
                String(item.id_foto).includes(q) ||
                String(item.id_especimen).includes(q) ||
                (item.descripcion_foto || '').toLowerCase().includes(q) ||
                (item.ruta_archivo || '').toLowerCase().includes(q) ||
                (item.id_colector && String(item.id_colector).includes(q)) ||
                (item.id_determinador && String(item.id_determinador).includes(q))
            );
        }

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="td-empty">No se encontraron imágenes.</td></tr>`;
        } else {
            filtered.forEach(item => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                if (this.selectedItem && this.selectedItem.id_foto === item.id_foto) {
                    tr.style.backgroundColor = 'var(--bg-hover)';
                }
                tr.onclick = () => {
                    this.selectedItem = item;
                    this.renderTable();
                };

                const isActivo = item.status == 1 || item.status === true;
                const statusBadge = `<span class="status-badge ${isActivo ? 'activo' : 'inactivo'}">${isActivo ? 'Activo' : 'Inactivo'}</span>`;
                
                let imgHTML = '';
                let src = item.ruta_archivo || '';
                if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                    src = '../' + String(src).replace(/^\.\//, '');
                }
                if (src && (src.startsWith('http') || src.startsWith('data:image') || /\.(jpe?g|png|gif|webp)(\?|$)/i.test(src))) {
                    imgHTML = `<img class="fototeca-table-thumb" src="${src}" alt="Vista previa" loading="lazy" />`;
                } else if (src) {
                    imgHTML = `<code style="font-size:0.8rem; background:var(--bg-input); padding:4px; border-radius:4px;">${item.ruta_archivo || 'N/A'}</code>`;
                } else {
                    imgHTML = `<span class="text-muted">—</span>`;
                }

                tr.innerHTML = `
                    <td style="font-weight: 600; color: var(--accent-color);">#${item.id_foto}</td>
                    <td>${item.id_especimen || '-'}</td>
                    <td>${imgHTML}</td>
                    <td>${item.descripcion_foto || '-'}</td>
                    <td>${item.id_colector || '-'}</td>
                    <td>${item.id_determinador || '-'}</td>
                    <td>${item.fecha_subida ? item.fecha_subida.split(' ')[0] : '-'}</td>
                    <td>${statusBadge}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    renderModificarForm() {
        if (!this.selectedItem) return;
        const form = document.getElementById('modificar-fototeca-form');
        Array.from(form.elements).forEach(el => {
            if (el.name && this.selectedItem[el.name] !== undefined) {
                if (el.type === 'date' && this.selectedItem[el.name]) {
                    el.value = String(this.selectedItem[el.name]).split(' ')[0];
                } else {
                    el.value = this.selectedItem[el.name];
                }
            }
        });
    }

    renderBajaForm() {
        if (!this.selectedItem) return;
        const desc = this.selectedItem.descripcion_foto || `ID #${this.selectedItem.id_foto}`;
        document.getElementById('baja-foto-name').textContent = desc;
    }

    async handleAltaSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fileInput = form.querySelector('input[type="file"]');
        const file = fileInput?.files?.[0];
        try {
            if (file) {
                const fd = new FormData();
                fd.append('archivo', file);
                fd.append('id_especimen', form.elements.namedItem('id_especimen').value);
                const desc = form.elements.namedItem('descripcion_foto')?.value || '';
                fd.append('descripcion_foto', desc);
                const col = form.elements.namedItem('id_colector')?.value;
                const det = form.elements.namedItem('id_determinador')?.value;
                if (col) fd.append('id_colector', col);
                if (det) fd.append('id_determinador', det);
                const response = await fetch(`${this.model.apiBase}/fototeca.php`, { method: 'POST', body: fd });
                const body = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(body.error || 'Error');
            } else {
                const formData = new FormData(form);
                formData.delete('archivo');
                const data = Object.fromEntries(formData.entries());
                if (!String(data.ruta_archivo || '').trim()) {
                    window.Utils.showToast('Suba un archivo o indique una URL en el campo ruta.', 'warning');
                    return;
                }
                await this.model.createFoto(data);
            }
            await this.model.fetchFotos();
            window.Utils.showToast('Imagen registrada.', 'success');
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast(err.message || 'Error al registrar la imagen', 'danger');
        }
    }

    async handleModificarSubmit(e) {
        e.preventDefault();
        if (!this.selectedItem) return;
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await this.model.updateFoto(this.selectedItem.id_foto, data);
            await this.model.fetchFotos();
            this.navigate('general');
        } catch (err) {
            alert('Error actualizando imagen');
        }
    }

    async handleBajaSubmit() {
        if (!this.selectedItem) return;
        try {
            await this.model.deleteFoto(this.selectedItem.id_foto);
            await this.model.fetchFotos();
            this.navigate('general');
        } catch (err) {
            alert('Error eliminando imagen');
        }
    }
}

window.FototecaController = new FototecaController();
