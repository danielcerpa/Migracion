class PrestamoController {
    constructor() {
        this.model = window.PrestamoModel;
        this.currentView = 'general';
        this.selectedItem = null;
        this.query = '';
        this._specimenesCache = null;
        this._pickerAbort = null;
        this._uiAbort = null;
    }

    selectedPrestamoId() {
        return this.model.prestamoId(this.selectedItem);
    }

    async init() {
        this.container = document.getElementById('prestamos-module');
        if (!this.container) return;

        if (this._uiAbort) this._uiAbort.abort();
        this._uiAbort = new AbortController();
        this.unbindEjemplarPicker();

        await this.model.fetchPrestamos();

        this.bindEvents();
        this.render();
        if (window.PrestamosTutorial) window.PrestamosTutorial.init();
    }

    bindEvents() {
        const { signal } = this._uiAbort;

        document.getElementById('btn-alta-prestamo')?.addEventListener('click', () => this.navigate('alta'), { signal });
        document.getElementById('btn-actualizar-prestamo')?.addEventListener('click', () => {
            if (!this.selectedItem) { alert('Seleccione un préstamo primero.'); return; }
            this.navigate('modificar', this.selectedItem);
        }, { signal });
        document.getElementById('btn-eliminar-prestamo')?.addEventListener('click', () => {
            if (!this.selectedItem) { alert('Seleccione un préstamo primero.'); return; }
            this.navigate('baja', this.selectedItem);
        }, { signal });
        document.getElementById('btn-registrar-devolucion')?.addEventListener('click', () => this.registrarDevolucion(), { signal });

        document.querySelectorAll('.btn-back-general').forEach(btn => {
            btn.addEventListener('click', () => this.navigate('general'), { signal });
        });
        document.getElementById('breadcrumb-back')?.addEventListener('click', () => this.navigate('general'), { signal });

        const searchInput = document.getElementById('search-prestamo-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.query = e.target.value;
                this.renderTable();
            }, { signal });
        }

        document.getElementById('alta-prestamo-form')?.addEventListener('submit', (e) => this.handleAltaSubmit(e), { signal });
        document.getElementById('modificar-prestamo-form')?.addEventListener('submit', (e) => this.handleModificarSubmit(e), { signal });
        document.getElementById('btn-confirmar-baja-pres')?.addEventListener('click', () => this.handleBajaSubmit(), { signal });

        ['alta-prestamo-form', 'modificar-prestamo-form'].forEach((fid) => {
            document.getElementById(fid)?.addEventListener('change', (e) => {
                if (e.target?.name === 'idEjemplar') {
                    this.onIdEjemplarChange(e.target.closest('form'));
                }
            }, { signal });
        });
    }

    unbindEjemplarPicker() {
        if (this._pickerAbort) {
            this._pickerAbort.abort();
            this._pickerAbort = null;
        }
    }

    async ensureSpecimenCache() {
        if (this._specimenesCache) return;
        try {
            const r = await fetch('../api/especimenes.php');
            if (!r.ok) throw new Error();
            const data = await r.json();
            this._specimenesCache = Array.isArray(data) ? data : [];
        } catch (_) {
            this._specimenesCache = [];
        }
    }

    async bindEjemplarPickerForCurrentView() {
        this.unbindEjemplarPicker();
        await this.ensureSpecimenCache();

        const formId = this.currentView === 'alta' ? 'alta-prestamo-form' : 'modificar-prestamo-form';
        const form = document.getElementById(formId);
        if (!form) return;
        const qInput = form.querySelector('.prestamo-ejemplar-search-input');
        const dd = form.querySelector('.prestamo-ejemplar-dropdown');
        const tbody = dd?.querySelector('.prestamo-ejemplar-dropdown-body');
        if (!qInput || !dd || !tbody) return;

        this._pickerAbort = new AbortController();
        const { signal } = this._pickerAbort;

        const renderDropdown = (term) => {
            const q = term.trim().toLowerCase();
            let rows = this._specimenesCache || [];
            if (q) {
                rows = rows.filter((e) => {
                    const id = String(e.id_especimen ?? '');
                    const nc = String(e.nombre_comun || '').toLowerCase();
                    const nci = String(e.nombre_cientifico || '').toLowerCase();
                    const sp = String(e.especie_nombre || '').toLowerCase();
                    return id.includes(q) || nc.includes(q) || nci.includes(q) || sp.includes(q);
                });
            }
            tbody.innerHTML = '';
            const slice = rows.slice(0, 40);
            if (slice.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="padding:10px;text-align:center;color:var(--text-muted)">Sin resultados</td></tr>';
            } else {
                slice.forEach((e) => {
                    const tr = document.createElement('tr');
                    tr.style.cursor = 'pointer';
                    tr.innerHTML = `<td style="padding:8px;font-weight:600">#${e.id_especimen}</td><td style="padding:8px">${e.nombre_comun || '—'}</td><td style="padding:8px;font-style:italic;color:var(--text-muted)">${e.nombre_cientifico || e.especie_nombre || '—'}</td>`;
                    tr.addEventListener('click', () => {
                        const idEl = form.elements.namedItem('idEjemplar');
                        const ncom = form.elements.namedItem('nombre_comun');
                        const ncie = form.elements.namedItem('nombre_cientifico');
                        if (idEl) idEl.value = String(e.id_especimen);
                        if (ncom) ncom.value = e.nombre_comun || '';
                        if (ncie) ncie.value = e.nombre_cientifico || e.especie_nombre || '';
                        qInput.value = '';
                        dd.style.display = 'none';
                        idEl?.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                    tbody.appendChild(tr);
                });
            }
            dd.style.display = 'block';
        };

        qInput.addEventListener('input', () => renderDropdown(qInput.value), { signal });
        qInput.addEventListener('focus', () => renderDropdown(qInput.value), { signal });
        document.addEventListener('click', (ev) => {
            if (!form.contains(ev.target)) dd.style.display = 'none';
        }, { signal });
    }

    async onIdEjemplarChange(form) {
        if (!form) return;
        const input = form.querySelector('input[name="idEjemplar"]');
        const nc = form.querySelector('input[name="nombre_cientifico"]');
        const ncom = form.querySelector('input[name="nombre_comun"]');
        if (!input || !nc || !ncom) return;
        const id = parseInt(input.value, 10);
        if (!id) {
            nc.value = '';
            ncom.value = '';
            return;
        }
        try {
            const r = await fetch(`../api/especimenes.php?id=${id}`);
            if (!r.ok) throw new Error();
            const esp = await r.json();
            if (!esp || !esp.id_especimen) {
                nc.value = '';
                ncom.value = '';
                window.Utils.showToast('No se encontró un espécimen con ese ID.', 'warning');
                return;
            }
            nc.value = esp.nombre_cientifico || '';
            ncom.value = esp.nombre_comun || '';
        } catch (_) {
            window.Utils.showToast('Error al consultar el espécimen.', 'danger');
        }
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
            const f = document.getElementById('alta-prestamo-form');
            if (f) {
                f.reset();
                const u = JSON.parse(localStorage.getItem('user') || '{}');
                const pm = f.elements.namedItem('prestamista');
                if (pm) {
                    pm.value = [u.name, u.last_name].filter(Boolean).join(' ').trim() || 'Colección';
                }
            }
        } else if (this.currentView === 'modificar') {
            this.renderModificarForm();
        } else if (this.currentView === 'baja') {
            this.renderBajaForm();
        }

        this.applyPermissions();
        lucide.createIcons();

        if (this.currentView !== 'alta' && this.currentView !== 'modificar') {
            this.unbindEjemplarPicker();
        } else {
            void this.bindEjemplarPickerForCurrentView();
        }
    }

    applyPermissions() {
        const canAdd = window.Utils.checkPermission('Prestamos', 'add');
        const canEdit = window.Utils.checkPermission('Prestamos', 'edit');
        const canDelete = window.Utils.checkPermission('Prestamos', 'delete');

        const btnAlta = document.getElementById('btn-alta-prestamo');
        const btnEdit = document.getElementById('btn-actualizar-prestamo');
        const btnDelete = document.getElementById('btn-eliminar-prestamo');
        const btnDev = document.getElementById('btn-registrar-devolucion');

        if (btnAlta) btnAlta.style.display = canAdd ? 'flex' : 'none';
        if (btnEdit) btnEdit.style.display = canEdit ? 'flex' : 'none';
        if (btnDelete) btnDelete.style.display = canDelete ? 'flex' : 'none';
        if (btnDev) btnDev.style.display = canEdit ? 'flex' : 'none';
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
                String(this.model.prestamoId(item) || '').includes(q) ||
                String(item.idEjemplar || item.id_especimen || '').includes(q)
            );
        }

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="td-empty">No se encontraron préstamos.</td></tr>`;
        } else {
            filtered.forEach(item => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                const sid = this.selectedPrestamoId();
                const iid = this.model.prestamoId(item);
                if (this.selectedItem && sid != null && sid === iid) {
                    tr.style.backgroundColor = 'var(--bg-hover)';
                }
                tr.onclick = () => {
                    this.selectedItem = item;
                    this.renderTable();
                };

                let badgeClass = 'activo';
                if (item.estado_prestamo === 'Devuelto') badgeClass = 'inactivo';
                if (item.estado_prestamo === 'Vencido' || item.estado_prestamo === 'Atrasado') badgeClass = 'baja';
                if (item.estado_prestamo === 'Baja') badgeClass = 'baja';
                if (item.status == 0) badgeClass = 'baja';

                const statusBadge = `<span class="status-badge ${badgeClass}">${item.estado_prestamo || 'Desconocido'}</span>`;
                const idShow = this.model.prestamoId(item);
                const idEsp = item.idEjemplar ?? item.id_especimen;

                tr.innerHTML = `
                    <td style="font-weight: 600; color: var(--accent-color);">#${idShow}</td>
                    <td>${idEsp || '-'}</td>
                    <td>${item.prestatario || '-'}</td>
                    <td>${item.institucion || item.institucion_prestatario || '-'}</td>
                    <td>${item.fecha_prestamo ? String(item.fecha_prestamo).split('T')[0].split(' ')[0] : '-'}</td>
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
        if (!form) return;
        const item = { ...this.selectedItem };
        if (item.idEjemplar == null && item.id_especimen != null) {
            item.idEjemplar = item.id_especimen;
        }
        Array.from(form.elements).forEach(el => {
            if (!el.name || item[el.name] === undefined) return;
            if (el.type === 'date' && item[el.name]) {
                el.value = String(item[el.name]).split('T')[0].split(' ')[0];
            } else {
                el.value = item[el.name];
            }
        });
    }

    renderBajaForm() {
        if (!this.selectedItem) return;
        const id = this.selectedPrestamoId();
        const desc = `ID #${id} - ${this.selectedItem.prestatario}`;
        document.getElementById('baja-pres-name').textContent = desc;
    }

    async registrarDevolucion() {
        if (!this.selectedItem) {
            alert('Seleccione un préstamo en la tabla.');
            return;
        }
        const id = this.selectedPrestamoId();
        if (id == null) return;
        const today = new Date().toISOString().slice(0, 10);
        const p = { ...this.selectedItem };
        p.idEjemplar = p.idEjemplar ?? p.id_especimen;
        p.institucion = p.institucion ?? p.institucion_prestatario ?? '';
        p.estado_prestamo = 'Devuelto';
        p.fecha_devolucion_real = today;
        try {
            await this.model.updatePrestamo(id, p);
            await this.model.fetchPrestamos();
            window.Utils.showToast('Devolución registrada.', 'success');
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('No se pudo registrar la devolución.', 'danger');
        }
    }

    async handleAltaSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await this.model.createPrestamo(data);
            await this.model.fetchPrestamos();
            window.Utils.showToast('Préstamo creado.', 'success');
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error creando préstamo.', 'danger');
        }
    }

    async handleModificarSubmit(e) {
        e.preventDefault();
        if (!this.selectedItem) return;
        const id = this.selectedPrestamoId();
        if (id == null) return;
        const formData = new FormData(e.target);
        const fromForm = Object.fromEntries(formData.entries());
        const data = { ...this.selectedItem, ...fromForm };
        data.idEjemplar = data.idEjemplar ?? data.id_especimen;
        data.institucion = data.institucion ?? data.institucion_prestatario;

        try {
            await this.model.updatePrestamo(id, data);
            await this.model.fetchPrestamos();
            window.Utils.showToast('Préstamo actualizado.', 'success');
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error actualizando préstamo.', 'danger');
        }
    }

    async handleBajaSubmit() {
        if (!this.selectedItem) return;
        const id = this.selectedPrestamoId();
        if (id == null) return;
        try {
            await this.model.deletePrestamo(id);
            await this.model.fetchPrestamos();
            window.Utils.showToast('Préstamo dado de baja.', 'success');
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error al dar de baja.', 'danger');
        }
    }
}

window.PrestamoController = new PrestamoController();
