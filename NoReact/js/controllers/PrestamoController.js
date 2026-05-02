class PrestamoController {
    constructor() {
        this.model = window.PrestamoModel;
        this.currentView = 'general';
        this.selectedItem = null;
        this.query = '';
    }

    async init() {
        this.container = document.getElementById('prestamos-module');
        if (!this.container) return;

        await this.model.fetchPrestamos();
        
        this.bindEvents();
        this.render();
        if (window.PrestamosTutorial) window.PrestamosTutorial.init();
    }

    bindEvents() {
        document.getElementById('btn-alta-prestamo')?.addEventListener('click', () => this.navigate('alta'));
        document.getElementById('btn-actualizar-prestamo')?.addEventListener('click', () => {
            if (!this.selectedItem) { alert('Seleccione un préstamo primero.'); return; }
            this.navigate('modificar', this.selectedItem);
        });
        document.getElementById('btn-eliminar-prestamo')?.addEventListener('click', () => {
            if (!this.selectedItem) { alert('Seleccione un préstamo primero.'); return; }
            this.navigate('baja', this.selectedItem);
        });

        document.querySelectorAll('.btn-back-general').forEach(btn => {
            btn.addEventListener('click', () => this.navigate('general'));
        });
        document.getElementById('breadcrumb-back')?.addEventListener('click', () => this.navigate('general'));

        const searchInput = document.getElementById('search-prestamo-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.query = e.target.value;
                this.renderTable();
            });
        }
        
        document.getElementById('alta-prestamo-form')?.addEventListener('submit', (e) => this.handleAltaSubmit(e));
        document.getElementById('modificar-prestamo-form')?.addEventListener('submit', (e) => this.handleModificarSubmit(e));
        document.getElementById('btn-confirmar-baja-pres')?.addEventListener('click', () => this.handleBajaSubmit());
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
            const el = document.getElementById(`view-pres-${v}`);
            if (el) el.style.display = v === this.currentView ? 'block' : 'none';
        });

        const breadcrumb = document.getElementById('prestamos-breadcrumb');
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
            document.getElementById('alta-prestamo-form').reset();
        } else if (this.currentView === 'modificar') {
            this.renderModificarForm();
        } else if (this.currentView === 'baja') {
            this.renderBajaForm();
        }

        this.applyPermissions();
        lucide.createIcons();
    }

    applyPermissions() {
        const canAdd = window.Utils.checkPermission('Prestamos', 'add');
        const canEdit = window.Utils.checkPermission('Prestamos', 'edit');
        const canDelete = window.Utils.checkPermission('Prestamos', 'delete');

        const btnAlta = document.getElementById('btn-alta-prestamo');
        const btnEdit = document.getElementById('btn-actualizar-prestamo');
        const btnDelete = document.getElementById('btn-eliminar-prestamo');

        if (btnAlta) btnAlta.style.display = canAdd ? 'flex' : 'none';
        if (btnEdit) btnEdit.style.display = canEdit ? 'flex' : 'none';
        if (btnDelete) btnDelete.style.display = canDelete ? 'flex' : 'none';
    }

    renderTable() {
        const tbody = document.getElementById('prestamo-table-body');
        if (!tbody) return;

        let filtered = this.model.items;
        if (this.query.trim() !== '') {
            const q = this.query.toLowerCase();
            filtered = filtered.filter(item => 
                (item.prestatario || '').toLowerCase().includes(q) ||
                (item.institucion || '').toLowerCase().includes(q) ||
                (item.estado_prestamo || '').toLowerCase().includes(q) ||
                String(item.idPrestamo).includes(q) ||
                String(item.idEjemplar).includes(q)
            );
        }

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="td-empty">No se encontraron préstamos.</td></tr>`;
        } else {
            filtered.forEach(item => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                if (this.selectedItem && this.selectedItem.idPrestamo === item.idPrestamo) {
                    tr.style.backgroundColor = 'var(--bg-hover)';
                }
                tr.onclick = () => {
                    this.selectedItem = item;
                    this.renderTable();
                };

                let badgeClass = 'activo';
                if (item.estado_prestamo === 'Devuelto') badgeClass = 'inactivo';
                if (item.estado_prestamo === 'Baja') badgeClass = 'baja';
                if (item.status == 0) badgeClass = 'baja';

                const statusBadge = `<span class="status-badge ${badgeClass}">${item.estado_prestamo || 'Desconocido'}</span>`;

                tr.innerHTML = `
                    <td style="font-weight: 600; color: var(--accent-color);">#${item.idPrestamo}</td>
                    <td>${item.idEjemplar || '-'}</td>
                    <td>${item.prestatario || '-'}</td>
                    <td>${item.institucion || '-'}</td>
                    <td>${item.fecha_prestamo ? item.fecha_prestamo.split('T')[0] : '-'}</td>
                    <td>${statusBadge}</td>
                    <td style="text-align: center;">${item.proposito || '-'}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    renderModificarForm() {
        if (!this.selectedItem) return;
        const form = document.getElementById('modificar-prestamo-form');
        Array.from(form.elements).forEach(el => {
            if (el.name && this.selectedItem[el.name] !== undefined) {
                if (el.type === 'date' && this.selectedItem[el.name]) {
                    el.value = String(this.selectedItem[el.name]).split('T')[0].split(' ')[0];
                } else {
                    el.value = this.selectedItem[el.name];
                }
            }
        });
    }

    renderBajaForm() {
        if (!this.selectedItem) return;
        const desc = `ID #${this.selectedItem.idPrestamo} - ${this.selectedItem.prestatario}`;
        document.getElementById('baja-pres-name').textContent = desc;
    }

    async handleAltaSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await this.model.createPrestamo(data);
            await this.model.fetchPrestamos();
            this.navigate('general');
        } catch (err) {
            alert('Error creando préstamo');
        }
    }

    async handleModificarSubmit(e) {
        e.preventDefault();
        if (!this.selectedItem) return;
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await this.model.updatePrestamo(this.selectedItem.idPrestamo, data);
            await this.model.fetchPrestamos();
            this.navigate('general');
        } catch (err) {
            alert('Error actualizando préstamo');
        }
    }

    async handleBajaSubmit() {
        if (!this.selectedItem) return;
        try {
            await this.model.deletePrestamo(this.selectedItem.idPrestamo);
            await this.model.fetchPrestamos();
            this.navigate('general');
        } catch (err) {
            alert('Error eliminando préstamo');
        }
    }
}

window.PrestamoController = new PrestamoController();
