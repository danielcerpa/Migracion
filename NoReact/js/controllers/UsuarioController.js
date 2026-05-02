class UsuarioController {
    constructor() {
        this.model = window.UsuarioModel;
        this.currentView = 'general';
        this.selectedUser = null;
        this.query = '';
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.permissionsForm = {}; // Store selections for Alta/Modificar
        this.modSearchTerm = '';
        this.showModDropdown = false;
        this._uiAbort = null;
    }

    async init() {
        this.container = document.getElementById('usuarios-module');
        if (!this.container) return;

        // Fetch initial data
        await Promise.all([
            this.model.fetchUsers(),
            this.model.getModulesAll(),
            this.model.getProfilesAll()
        ]);

        if (this._uiAbort) this._uiAbort.abort();
        this._uiAbort = new AbortController();

        this.bindEvents();
        this.render();
        if (window.UsuariosTutorial) window.UsuariosTutorial.init();
    }

    bindEvents() {
        const { signal } = this._uiAbort;

        // Use event delegation for static elements
        this.container.addEventListener('click', (e) => {
            const target = e.target.closest('button, .btn-back, #breadcrumb-back');
            if (!target) return;

            if (target.id === 'btn-alta') this.navigate('alta');
            if (target.id === 'btn-actualizar') {
                if (!this.selectedUser) { alert('Seleccione un usuario de la tabla primero.'); return; }
                this.navigate('modificar', this.selectedUser);
            }
            if (target.id === 'btn-eliminar') {
                if (!this.selectedUser) { alert('Seleccione un usuario de la tabla primero.'); return; }
                this.navigate('baja', this.selectedUser);
            }
            if (target.classList.contains('btn-back-general') || target.id === 'breadcrumb-back') {
                this.navigate('general');
            }
            if (target.classList.contains('toggle-password')) {
                const inputId = target.dataset.target;
                const input = document.getElementById(inputId);
                if (input) {
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    target.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}" style="width: 18px; height: 18px;"></i>`;
                    lucide.createIcons();
                }
            }
            if (target.id === 'btn-clear-search') {
                this.query = '';
                const input = document.getElementById('search-users-input');
                if (input) input.value = '';
                this.currentPage = 1;
                this.renderTable();
            }
            if (target.id === 'btn-clear-mod-search') {
                this.modSearchTerm = '';
                const input = document.getElementById('search-mod-input');
                if (input) input.value = '';
                this.selectedUser = null;
                this.renderModificarForm();
            }
        }, { signal });

        // Search inputs
        const searchInput = document.getElementById('search-users-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.query = e.target.value;
                this.currentPage = 1;
                this.renderTable();
                const clearBtn = document.getElementById('btn-clear-search');
                if (clearBtn) clearBtn.style.visibility = this.query ? 'visible' : 'hidden';
            }, { signal });
        }

        const modSearchInput = document.getElementById('search-mod-input');
        if (modSearchInput) {
            modSearchInput.addEventListener('input', (e) => {
                this.modSearchTerm = e.target.value;
                this.showModDropdown = true;
                this.renderModDropdown();
                const clearBtn = document.getElementById('btn-clear-mod-search');
                if (clearBtn) clearBtn.style.visibility = this.modSearchTerm ? 'visible' : 'hidden';
            }, { signal });
            modSearchInput.addEventListener('focus', () => {
                this.showModDropdown = true;
                this.renderModDropdown();
            }, { signal });
            // Hide dropdown on blur with delay to allow clicks
            modSearchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    this.showModDropdown = false;
                    const dropdown = document.getElementById('search-mod-dropdown');
                    if (dropdown) dropdown.style.display = 'none';
                }, 200);
            }, { signal });
        }

        // Pagination select
        document.getElementById('rows-per-page-select')?.addEventListener('change', (e) => {
            this.rowsPerPage = parseInt(e.target.value, 10);
            this.currentPage = 1;
            this.renderTable();
        }, { signal });

        // Forms
        document.getElementById('alta-usuario-form')?.addEventListener('submit', (e) => this.handleAltaSubmit(e), { signal });
        document.getElementById('modificar-usuario-form')?.addEventListener('submit', (e) => this.handleModificarSubmit(e), { signal });
        document.getElementById('btn-confirmar-baja')?.addEventListener('click', () => this.handleBajaSubmit(), { signal });

        // Real-time validation for Alta
        document.getElementById('alta-usuario-form')?.addEventListener('input', () => this.validateAltaForm(), { signal });
    }

    navigate(view, user = null) {
        if (user) {
            this.selectedUser = user;
            if (view === 'modificar') {
                this.modSearchTerm = `${user.name} ${user.last_name || ''} ${user.second_last_name || ''}`.trim();
                const input = document.getElementById('search-mod-input');
                if (input) input.value = this.modSearchTerm;
            }
        } else if (view === 'alta') {
            this.selectedUser = null;
        }

        this.currentView = view;
        this.render();
    }

    render() {
        const views = ['general', 'alta', 'modificar', 'baja'];
        views.forEach(v => {
            const el = document.getElementById(`view-${v}`);
            if (el) el.style.display = v === this.currentView ? 'block' : 'none';
        });

        const breadcrumb = document.getElementById('usuarios-breadcrumb');
        const currentCrumb = document.getElementById('current-crumb');
        if (breadcrumb && currentCrumb) {
            if (this.currentView === 'general') {
                breadcrumb.style.display = 'none';
            } else {
                breadcrumb.style.display = 'flex';
                let label = this.currentView === 'modificar' ? 'Actualizar' : this.currentView.charAt(0).toUpperCase() + this.currentView.slice(1);
                currentCrumb.textContent = label;
            }
        }

        if (this.currentView === 'general') this.renderTable();
        else if (this.currentView === 'alta') this.renderAltaForm();
        else if (this.currentView === 'modificar') this.renderModificarForm();
        else if (this.currentView === 'baja') this.renderBajaForm();

        this.applyPermissions();
        lucide.createIcons();
    }

    applyPermissions() {
        const canAdd = window.Utils.checkPermission('Usuarios', 'add');
        const canEdit = window.Utils.checkPermission('Usuarios', 'edit');
        const canDelete = window.Utils.checkPermission('Usuarios', 'delete');

        const btnAlta = document.getElementById('btn-alta');
        const btnEdit = document.getElementById('btn-actualizar');
        const btnDelete = document.getElementById('btn-eliminar');

        if (btnAlta) btnAlta.style.display = canAdd ? 'flex' : 'none';
        if (btnEdit) btnEdit.style.display = canEdit ? 'flex' : 'none';
        if (btnDelete) btnDelete.style.display = canDelete ? 'flex' : 'none';
    }

    renderTable() {
        const tbody = document.getElementById('usuarios-table-body');
        if (!tbody) return;

        let filtered = this.model.users;
        if (this.query.trim() !== '') {
            const q = this.query.toLowerCase();
            filtered = filtered.filter(u => 
                u.name.toLowerCase().includes(q) ||
                (u.last_name || '').toLowerCase().includes(q) ||
                (u.second_last_name || '').toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q)
            );
        }

        const startIndex = (this.currentPage - 1) * this.rowsPerPage;
        const paginated = filtered.slice(startIndex, startIndex + this.rowsPerPage);

        tbody.innerHTML = '';
        if (paginated.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="td-empty">No se encontraron usuarios para "${this.query}".</td></tr>`;
        } else {
            paginated.forEach(u => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                if (this.selectedUser && this.selectedUser.idUser === u.idUser) {
                    tr.classList.add('selected-row');
                }
                tr.onclick = () => {
                    this.selectedUser = u;
                    this.renderTable();
                };

                tr.innerHTML = `
                    <td class="td-id">#${u.idUser}</td>
                    <td class="td-name">${u.name}</td>
                    <td>${u.last_name || '-'}</td>
                    <td>${u.second_last_name || '-'}</td>
                    <td><code class="user-code">${u.email}</code></td>
                    <td><span class="status-badge ${u.status ? 'activo' : 'inactivo'}">${u.status ? 'Activo' : 'Inactivo'}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
        this.renderPagination(filtered.length);
    }

    renderPagination(totalItems) {
        const container = document.getElementById('pagination-container');
        if (!container) return;
        
        if (totalItems === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'flex';
        const totalPages = Math.ceil(totalItems / this.rowsPerPage);
        const startIndex = (this.currentPage - 1) * this.rowsPerPage;
        
        document.getElementById('pagination-info').innerHTML = `Mostrando <strong>${startIndex + 1}</strong> - <strong>${Math.min(startIndex + this.rowsPerPage, totalItems)}</strong> de <strong>${totalItems}</strong> usuarios`;
        
        const controls = document.getElementById('pagination-controls');
        controls.innerHTML = '';
        
        // Prev button
        const btnPrev = document.createElement('button');
        btnPrev.className = 'btn-page-nav';
        btnPrev.disabled = this.currentPage === 1;
        btnPrev.innerHTML = '<i data-lucide="chevron-left" style="width:20px;height:20px;"></i>';
        btnPrev.onclick = (e) => { e.stopPropagation(); this.currentPage--; this.renderTable(); lucide.createIcons(); };
        controls.appendChild(btnPrev);
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (totalPages <= 7 || i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                const btn = document.createElement('button');
                btn.className = `btn-page ${this.currentPage === i ? 'active' : ''}`;
                btn.textContent = i;
                btn.onclick = (e) => { e.stopPropagation(); this.currentPage = i; this.renderTable(); lucide.createIcons(); };
                controls.appendChild(btn);
            } else if (i === 2 || i === totalPages - 1) {
                const span = document.createElement('span');
                span.textContent = '...';
                span.style.color = 'var(--text-muted)';
                controls.appendChild(span);
            }
        }
        
        // Next button
        const btnNext = document.createElement('button');
        btnNext.className = 'btn-page-nav';
        btnNext.disabled = this.currentPage === totalPages;
        btnNext.innerHTML = '<i data-lucide="chevron-right" style="width:20px;height:20px;"></i>';
        btnNext.onclick = (e) => { e.stopPropagation(); this.currentPage++; this.renderTable(); lucide.createIcons(); };
        controls.appendChild(btnNext);
    }

    renderPermissionsTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const sinAcceso = this.model.profiles.find(p => p.nickname === 'SinAcceso');
        const defaultProfileId = sinAcceso ? String(sinAcceso.idProfile) : '5';

        let html = '<table class="permissions-dual-table"><tbody>';
        for (let i = 0; i < this.model.modules.length; i += 2) {
            html += '<tr>';
            const m1 = this.model.modules[i];
            const m2 = this.model.modules[i+1];
            
            if (!this.permissionsForm[m1.idModule]) this.permissionsForm[m1.idModule] = defaultProfileId;
            if (m2 && !this.permissionsForm[m2.idModule]) this.permissionsForm[m2.idModule] = defaultProfileId;

            html += `<td class="module-label-cell">${m1.name}</td>`;
            html += `<td class="select-cell"><select class="form-select custom-select-vanilla" data-module="${m1.idModule}">
                ${this.model.profiles.map(p => `<option value="${p.idProfile}" ${this.permissionsForm[m1.idModule] == p.idProfile ? 'selected' : ''} class="${p.nickname === 'SinAcceso' ? 'text-danger' : ''}">${p.nickname}</option>`).join('')}
            </select></td>`;

            if (m2) {
                html += `<td class="module-label-cell">${m2.name}</td>`;
                html += `<td class="select-cell"><select class="form-select custom-select-vanilla" data-module="${m2.idModule}">
                    ${this.model.profiles.map(p => `<option value="${p.idProfile}" ${this.permissionsForm[m2.idModule] == p.idProfile ? 'selected' : ''} class="${p.nickname === 'SinAcceso' ? 'text-danger' : ''}">${p.nickname}</option>`).join('')}
                </select></td>`;
            } else {
                html += `<td class="module-label-cell"></td><td class="select-cell"></td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        container.innerHTML = html;

        const sig = this._uiAbort?.signal;
        const sinAccesoId = sinAcceso ? String(sinAcceso.idProfile) : null;

        const updateDangerState = (sel) => {
            if (sinAccesoId && String(sel.value) === sinAccesoId) {
                sel.classList.add('is-danger');
            } else {
                sel.classList.remove('is-danger');
            }
        };

        container.querySelectorAll('select').forEach(sel => {
            updateDangerState(sel); // estado inicial
            sel.addEventListener('change', (e) => {
                this.permissionsForm[e.target.dataset.module] = e.target.value;
                updateDangerState(e.target);
            }, sig ? { signal: sig } : undefined);
        });
    }

    /**
     * Exige al menos un módulo con un perfil distinto de «Sin Acceso» (evita usuarios bloqueados por error).
     */
    permisosTienenAccesoOperativo() {
        const sin = this.model.profiles.find(p => p.nickname === 'Sin Acceso' || p.nickname === 'SinAcceso');
        const sinId = sin ? String(sin.idProfile) : null;
        return Object.entries(this.permissionsForm).some(([, prof]) => (sinId == null ? true : String(prof) !== sinId));
    }

    renderReferenceTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const profiles = this.model.profiles.filter(p => p.nickname !== 'SinAcceso');
        if (profiles.length === 0) return;

        const keys = Object.keys(profiles[0]).filter(k => k.startsWith('key_'));
        const nameMap = { 'key_add': 'Alta', 'key_edit': 'Modificar', 'key_delete': 'Baja', 'key_export': 'Exportar' };

        let html = `<table class="compact-table"><thead><tr><th style="text-align: center;">Perfil</th>`;
        keys.forEach(k => html += `<th>${nameMap[k] || k}</th>`);
        html += `</tr></thead><tbody>`;

        profiles.forEach(p => {
            html += `<tr><td class="profile-name-cell">${p.nickname}</td>`;
            keys.forEach(k => {
                const val = Boolean(p[k]);
                html += `<td><i data-lucide="${val ? 'check-circle' : 'x-circle'}" style="width: 16px; height: 16px; color: ${val ? 'var(--success-color)' : '#EF4444'};"></i></td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;
        lucide.createIcons();
    }

    renderModDropdown() {
        const dropdown = document.getElementById('search-mod-dropdown');
        if (!dropdown) return;

        if (!this.showModDropdown || this.modSearchTerm.trim() === '') {
            dropdown.style.display = 'none';
            return;
        }

        const q = this.modSearchTerm.toLowerCase();
        const filtered = this.model.users.filter(u => 
            u.name.toLowerCase().includes(q) ||
            (u.last_name || '').toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );

        dropdown.innerHTML = '';
        if (filtered.length === 0) {
            dropdown.innerHTML = '<div style="padding: 0.75rem 1rem; color: var(--text-muted);">No se encontraron resultados</div>';
        } else {
            filtered.forEach(u => {
                const item = document.createElement('div');
                item.className = 'search-dropdown-item';
                item.style.padding = '0.75rem 1rem';
                item.style.cursor = 'pointer';
                item.style.borderBottom = '1px solid var(--border-color)';
                item.innerHTML = `
                    <div style="font-weight: 500; color: var(--text-color);">${u.name} ${u.last_name || ''}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${u.email}</div>
                `;
                item.onmousedown = (e) => {
                    e.preventDefault();
                    this.selectedUser = u;
                    this.modSearchTerm = `${u.name} ${u.last_name || ''} ${u.second_last_name || ''}`.trim();
                    const input = document.getElementById('search-mod-input');
                    if (input) input.value = this.modSearchTerm;
                    this.showModDropdown = false;
                    this.renderModificarForm();
                };
                dropdown.appendChild(item);
            });
        }
        dropdown.style.display = 'block';
    }

    renderAltaForm() {
        document.getElementById('alta-usuario-form').reset();
        this.permissionsForm = {};
        this.renderPermissionsTable('alta-permissions-container');
        this.renderReferenceTable('alta-reference-container');
        this.validateAltaForm();
    }

    validateAltaForm() {
        const form = document.getElementById('alta-usuario-form');
        const btn = document.getElementById('btn-save-alta');
        if (!form || !btn) return;
        
        const name = form.name.value.trim();
        const lastName = form.last_name.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value.trim();

        const isEmailValid = window.Utils.validateEmail(email);
        const isValid = name && lastName && email && isEmailValid && password.length >= 3;
        
        btn.disabled = !isValid;
    }

    renderModificarForm() {
        const formContent = document.getElementById('modificar-form-content');
        const subtitle = document.getElementById('mod-subtitle');
        const form = document.getElementById('modificar-usuario-form');
        const btnSave = document.getElementById('btn-save-modificar');

        if (!this.selectedUser) {
            formContent.style.opacity = '0.5';
            formContent.style.pointerEvents = 'none';
            subtitle.textContent = 'Busca y selecciona un usuario para editar';
            btnSave.disabled = true;
            form.reset();
            return;
        }

        formContent.style.opacity = '1';
        formContent.style.pointerEvents = 'auto';
        subtitle.textContent = `Editando perfil de: ${this.selectedUser.name} ${this.selectedUser.last_name || ''}`;
        btnSave.disabled = false;

        form.name.value = this.selectedUser.name || '';
        form.last_name.value = this.selectedUser.last_name || '';
        form.second_last_name.value = this.selectedUser.second_last_name || '';
        form.email.value = this.selectedUser.email || '';
        form.status.value = this.selectedUser.status ? "1" : "0";
        form.password.value = '';

        // Load permissions
        this.permissionsForm = {};
        if (this.selectedUser.permisos) {
            this.selectedUser.permisos.forEach(p => {
                this.permissionsForm[p.idModule] = String(p.idProfile);
            });
        }
        
        this.renderPermissionsTable('modificar-permissions-container');
        this.renderReferenceTable('modificar-reference-container');
    }

    renderBajaForm() {
        if (!this.selectedUser) return;
        document.getElementById('baja-user-name').textContent = `${this.selectedUser.name} ${this.selectedUser.last_name}`;
        document.getElementById('baja-user-email').textContent = this.selectedUser.email;
    }

    async handleAltaSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const btnSave = document.getElementById('btn-save-alta');

        const data = {
            name: form.name.value.trim(),
            last_name: form.last_name.value.trim(),
            second_last_name: form.second_last_name.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value.trim(),
            permisos: Object.entries(this.permissionsForm).map(([mod, prof]) => ({ idModule: Number(mod), idProfile: Number(prof) }))
        };

        if (!window.Utils.validateEmail(data.email)) {
            window.Utils.showToast('El formato del correo electrónico no es válido.', 'warning');
            return;
        }

        if (!this.permisosTienenAccesoOperativo()) {
            window.Utils.showToast('Asigne al menos un módulo con un perfil distinto de «Sin Acceso».', 'warning');
            return;
        }

        try {
            window.Utils.setButtonLoading(btnSave, true);
            await this.model.createUser(data);
            window.Utils.showToast('Usuario creado exitosamente.', 'success');
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error al crear el usuario: ' + (err.message || 'Error de conexión'), 'danger');
        } finally {
            window.Utils.setButtonLoading(btnSave, false);
        }
    }

    async handleModificarSubmit(e) {
        e.preventDefault();
        if (!this.selectedUser) return;
        const form = e.target;
        const btnSave = document.getElementById('btn-save-modificar');

        const data = {
            name: form.name.value.trim(),
            last_name: form.last_name.value.trim(),
            second_last_name: form.second_last_name.value.trim(),
            status: form.status.value === "1",
            permisos: Object.entries(this.permissionsForm).map(([mod, prof]) => ({ idModule: Number(mod), idProfile: Number(prof) }))
        };

        if (form.password.value) {
            if (form.password.value.length < 3) {
                window.Utils.showToast('La nueva contraseña debe tener al menos 3 caracteres.', 'warning');
                return;
            }
            data.password = form.password.value;
        }

        if (!this.permisosTienenAccesoOperativo()) {
            window.Utils.showToast('Debe quedar al menos un módulo con perfil distinto de «Sin Acceso».', 'warning');
            return;
        }

        try {
            window.Utils.setButtonLoading(btnSave, true);
            await this.model.updateUser(this.selectedUser.idUser, data);
            window.Utils.showToast('Usuario actualizado correctamente.', 'success');
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error al actualizar el usuario.', 'danger');
        } finally {
            window.Utils.setButtonLoading(btnSave, false);
        }
    }

    async handleBajaSubmit() {
        if (!this.selectedUser) return;
        const btnConfirm = document.getElementById('btn-confirmar-baja');
        
        try {
            window.Utils.setButtonLoading(btnConfirm, true);
            await this.model.deleteUser(this.selectedUser.idUser);
            window.Utils.showToast('Usuario dado de baja (Inactivo).', 'success');
            this.navigate('general');
        } catch (err) {
            window.Utils.showToast('Error al dar de baja al usuario.', 'danger');
        } finally {
            window.Utils.setButtonLoading(btnConfirm, false);
        }
    }
}

// Expose globally
window.UsuarioController = new UsuarioController();
