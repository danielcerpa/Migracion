class PerfilController {
    constructor() {
        this.model = window.PerfilModel;
        this.currentView = 'general';
        this.selectedProfile = null;
        this.query = '';
        this.currentPage = 1;
        this.rowsPerPage = 10;
    }

    async init() {
        this.container = document.getElementById('perfiles-module');
        if (!this.container) return;

        await this.model.fetchProfiles();

        this.bindEvents();
        this.render();
        if (window.PerfilesTutorial) window.PerfilesTutorial.init();
    }

    bindEvents() {
        // Navigation events
        document.getElementById('btn-alta-perfil')?.addEventListener('click', () => this.navigate('alta'));
        document.getElementById('btn-actualizar-perfil')?.addEventListener('click', () => {
            if (!this.selectedProfile) { alert('Seleccione un perfil de la tabla primero.'); return; }
            this.navigate('modificar', this.selectedProfile);
        });
        document.getElementById('btn-eliminar-perfil')?.addEventListener('click', () => {
            if (!this.selectedProfile) { alert('Seleccione un perfil de la tabla primero.'); return; }
            this.navigate('baja', this.selectedProfile);
        });

        // Back buttons
        document.querySelectorAll('.btn-back-general').forEach(btn => {
            btn.addEventListener('click', () => this.navigate('general'));
        });
        document.getElementById('breadcrumb-back')?.addEventListener('click', () => this.navigate('general'));

        // Search
        const searchInput = document.getElementById('search-profiles-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.query = e.target.value;
                this.currentPage = 1;
                this.renderTable();
            });
        }
        document.getElementById('btn-clear-search')?.addEventListener('click', () => {
            this.query = '';
            if (searchInput) searchInput.value = '';
            this.renderTable();
        });

        // Forms
        document.getElementById('alta-perfil-form')?.addEventListener('submit', (e) => this.handleAltaSubmit(e));
        document.getElementById('modificar-perfil-form')?.addEventListener('submit', (e) => this.handleModificarSubmit(e));
        document.getElementById('btn-confirmar-baja')?.addEventListener('click', () => this.handleBajaSubmit());
    }

    navigate(view, profile = null) {
        if (profile) this.selectedProfile = profile;
        else if (view === 'alta') this.selectedProfile = null;

        this.currentView = view;
        this.render();
    }

    render() {
        const views = ['general', 'alta', 'modificar', 'baja'];
        views.forEach(v => {
            const el = document.getElementById(`view-${v}`);
            if (el) el.style.display = v === this.currentView ? 'block' : 'none';
        });

        // Breadcrumbs visibility
        const breadcrumb = document.getElementById('perfiles-breadcrumb');
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
            this.renderAltaForm();
        } else if (this.currentView === 'modificar') {
            this.renderModificarForm();
        } else if (this.currentView === 'baja') {
            this.renderBajaForm();
        }

        this.applyPermissions();
        lucide.createIcons();
    }

    applyPermissions() {
        const canAdd = window.Utils.checkPermission('Perfiles', 'add');
        const canEdit = window.Utils.checkPermission('Perfiles', 'edit');
        const canDelete = window.Utils.checkPermission('Perfiles', 'delete');

        const btnAlta = document.getElementById('btn-alta-perfil');
        const btnEdit = document.getElementById('btn-actualizar-perfil');
        const btnDelete = document.getElementById('btn-eliminar-perfil');

        if (btnAlta) btnAlta.style.display = canAdd ? 'flex' : 'none';
        if (btnEdit) btnEdit.style.display = canEdit ? 'flex' : 'none';
        if (btnDelete) btnDelete.style.display = canDelete ? 'flex' : 'none';
    }

    renderTable() {
        const tbody = document.getElementById('perfiles-table-body');
        if (!tbody) return;

        let filtered = this.model.profiles;
        if (this.query.trim() !== '') {
            const q = this.query.toLowerCase();
            filtered = filtered.filter(p => 
                p.nickname.toLowerCase().includes(q) ||
                (p.description || '').toLowerCase().includes(q)
            );
        }

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="td-empty">No se encontraron perfiles para "${this.query}".</td></tr>`;
        } else {
            filtered.forEach(p => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                if (this.selectedProfile && this.selectedProfile.idProfile === p.idProfile) {
                    tr.style.backgroundColor = 'var(--bg-hover)';
                }
                tr.onclick = () => {
                    this.selectedProfile = p;
                    this.renderTable();
                };

                const renderCheck = (val) => val ? `<i data-lucide="check-circle" style="color: var(--success-color); width: 18px;"></i>` : `<i data-lucide="x-circle" style="color: #EF4444; width: 18px;"></i>`;

                tr.innerHTML = `
                    <td class="td-id">#${p.idProfile}</td>
                    <td class="td-name" style="color: var(--accent-color); font-weight: 600;">${p.nickname}</td>
                    <td>${p.description || '-'}</td>
                    <td style="text-align: center;">${renderCheck(p.key_add)}</td>
                    <td style="text-align: center;">${renderCheck(p.key_edit)}</td>
                    <td style="text-align: center;">${renderCheck(p.key_delete)}</td>
                    <td style="text-align: center;">${renderCheck(p.key_export)}</td>
                `;
                tbody.appendChild(tr);
            });
        }
        lucide.createIcons();
    }

    renderAltaForm() {
        document.getElementById('alta-perfil-form').reset();
    }

    renderModificarForm() {
        if (!this.selectedProfile) return;
        const form = document.getElementById('modificar-perfil-form');
        form.nickname.value = this.selectedProfile.nickname || '';
        form.description.value = this.selectedProfile.description || '';
        form.key_add.checked = Boolean(this.selectedProfile.key_add);
        form.key_edit.checked = Boolean(this.selectedProfile.key_edit);
        form.key_delete.checked = Boolean(this.selectedProfile.key_delete);
        form.key_export.checked = Boolean(this.selectedProfile.key_export);
    }

    renderBajaForm() {
        if (!this.selectedProfile) return;
        document.getElementById('baja-perfil-name').textContent = this.selectedProfile.nickname;
    }

    async handleAltaSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const btnSave = form.closest('.screen-container').querySelector('.btn-primary');

        const data = {
            nickname: form.nickname.value.trim(),
            description: form.description.value.trim(),
            key_add: form.key_add.checked,
            key_edit: form.key_edit.checked,
            key_delete: form.key_delete.checked,
            key_export: form.key_export.checked
        };

        if (!data.nickname) {
            window.Utils.showToast('El nombre del perfil es obligatorio.', 'warning');
            return;
        }

        try {
            window.Utils.setButtonLoading(btnSave, true);
            await this.model.createProfile(data);
            await this.model.fetchProfiles();
            window.Utils.showToast('Perfil creado exitosamente.', 'success');
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error al crear el perfil: ' + (err.message || 'Error desconocido'), 'danger');
        } finally {
            window.Utils.setButtonLoading(btnSave, false);
        }
    }

    async handleModificarSubmit(e) {
        e.preventDefault();
        if (!this.selectedProfile) return;
        const form = e.target;
        const btnSave = form.closest('.screen-container').querySelector('.btn-primary');

        const data = {
            nickname: form.nickname.value.trim(),
            description: form.description.value.trim(),
            key_add: form.key_add.checked,
            key_edit: form.key_edit.checked,
            key_delete: form.key_delete.checked,
            key_export: form.key_export.checked
        };

        if (!data.nickname) {
            window.Utils.showToast('El nombre del perfil no puede estar vacío.', 'warning');
            return;
        }

        try {
            window.Utils.setButtonLoading(btnSave, true);
            await this.model.updateProfile(this.selectedProfile.idProfile, data);
            await this.model.fetchProfiles();
            window.Utils.showToast('Perfil actualizado correctamente.', 'success');
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error al actualizar el perfil.', 'danger');
        } finally {
            window.Utils.setButtonLoading(btnSave, false);
        }
    }

    async handleBajaSubmit() {
        if (!this.selectedProfile) return;
        const btnConfirm = document.getElementById('btn-confirmar-baja');
        
        try {
            window.Utils.setButtonLoading(btnConfirm, true);
            await this.model.deleteProfile(this.selectedProfile.idProfile);
            await this.model.fetchProfiles();
            window.Utils.showToast('Perfil eliminado exitosamente.', 'success');
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error al eliminar el perfil. Es posible que esté en uso.', 'danger');
        } finally {
            window.Utils.setButtonLoading(btnConfirm, false);
        }
    }
}

window.PerfilController = new PerfilController();
