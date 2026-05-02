class EspecimenController {
    constructor() {
        this.model = window.EspecimenModel;
        this.currentView = 'general';
        this.selectedItem = null;
        this.query = '';
    }

    async init() {
        this.container = document.getElementById('especimenes-module');
        if (!this.container) return;

        console.log('EspecimenController: Initializing for container', this.container);
        
        this.currentView = 'general';
        this.selectedItem = null;
        this.query = '';

        // Attach event delegation to the NEW container every time it is injected
        this.setupDelegation();

        // Fetch data
        await this.model.fetchEspecimenes();
        this.render();
        if (window.EspecimenesTutorial) window.EspecimenesTutorial.init();
    }

    setupDelegation() {
        // Clear any previous listeners if necessary (though since the container is new, it's not strictly needed)
        // But we must use the current this.container
        this.container.onclick = (e) => {
            const target = e.target.closest('[id], .btn-back-general, .insect-card');
            if (!target) return;

            console.log('EspecimenController: Clicked on', target.id || target.className);

            if (target.id === 'btn-alta-especimen') {
                this.navigate('alta');
            } else if (target.id === 'btn-actualizar-especimen' || target.id === 'btn-edit-from-detail') {
                if (!this.selectedItem) { alert('Seleccione un espécimen primero.'); return; }
                this.navigate('modificar');
            } else if (target.id === 'btn-eliminar-especimen' || target.id === 'btn-delete-from-detail') {
                if (!this.selectedItem) { alert('Seleccione un espécimen primero.'); return; }
                this.navigate('baja');
            } else if (target.id === 'btn-confirmar-baja-esp') {
                this.handleBajaSubmit();
            } else if (target.id === 'breadcrumb-back' || target.classList.contains('btn-back-general')) {
                this.navigate('general');
            }

            const card = target.closest('.insect-card');
            if (card) {
                const id = parseInt(card.dataset.id);
                const item = this.model.items.find(i => i.id_especimen === id);
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
        if (formAlta) {
            formAlta.onsubmit = (e) => this.handleAltaSubmit(e);
        }

        const formMod = this.container.querySelector('#modificar-especimen-form');
        if (formMod) {
            formMod.onsubmit = (e) => this.handleModificarSubmit(e);
        }
    }

    navigate(view) {
        this.currentView = view;
        this.render();
    }

    render() {
        if (!this.container) return;
        
        const views = ['general', 'alta', 'modificar', 'baja', 'detalle'];
        views.forEach(v => {
            const el = this.container.querySelector(`#view-esp-${v}`);
            if (el) el.style.display = (v === this.currentView) ? 'block' : 'none';
        });

        const breadcrumb = this.container.querySelector('#especimenes-breadcrumb');
        const currentCrumb = this.container.querySelector('#current-crumb');
        if (breadcrumb && currentCrumb) {
            breadcrumb.style.display = (this.currentView === 'general') ? 'none' : 'flex';
            if (this.currentView !== 'general') {
                const labels = { alta: 'Nuevo', modificar: 'Actualizar', baja: 'Eliminar', detalle: 'Ficha Técnica' };
                currentCrumb.textContent = labels[this.currentView] || this.currentView;
            }
        }

        if (this.currentView === 'general') {
            this.renderCards();
        } else if (this.currentView === 'modificar') {
            this.fillModificarForm();
        } else if (this.currentView === 'baja') {
            const nameEl = this.container.querySelector('#baja-esp-name');
            if (nameEl && this.selectedItem) nameEl.textContent = this.selectedItem.nombre_cientifico || this.selectedItem.nombre_comun;
        } else if (this.currentView === 'detalle') {
            this.renderDetalle();
        }

        lucide.createIcons();
    }

    renderCards() {
        const grid = this.container.querySelector('#especimen-cards-grid');
        if (!grid) return;

        let filtered = this.model.items;
        if (this.query.trim()) {
            const q = this.query.toLowerCase();
            filtered = filtered.filter(i => 
                (i.nombre_comun || '').toLowerCase().includes(q) ||
                (i.nombre_cientifico || '').toLowerCase().includes(q) ||
                String(i.id_especimen).includes(q)
            );
        }

        grid.innerHTML = filtered.map(item => `
            <div class="insect-card" data-id="${item.id_especimen}" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 12px; cursor: pointer;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                    <span style="font-weight: 700;">#${String(item.id_especimen).padStart(5, '0')}</span>
                    <span class="status-badge" style="background:${item.status==1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color:${item.status==1 ? '#10B981' : '#EF4444'}; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700;">
                        ${item.status==1 ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </div>
                <h3 style="margin: 0; font-size: 1.1rem;">${item.nombre_comun || 'Sin nombre'}</h3>
                <p style="margin: 4px 0 12px 0; font-style: italic; color: var(--text-muted); font-size: 0.9rem;">${item.nombre_cientifico || 'N/A'}</p>
            </div>
        `).join('') || '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No se encontraron registros.</div>';
    }

    fillModificarForm() {
        const form = this.container.querySelector('#modificar-especimen-form');
        if (!form || !this.selectedItem) return;
        Object.entries(this.selectedItem).forEach(([key, val]) => {
            const input = form.elements[key];
            if (input) {
                if (input.type === 'date' && val) input.value = val.split('T')[0];
                else input.value = val;
            }
        });
    }

    renderDetalle() {
        const detailContent = this.container.querySelector('#especimen-detalle-content');
        if (!detailContent || !this.selectedItem) return;
        const s = this.selectedItem;
        detailContent.innerHTML = `
            <div class="form-card" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 2.5rem; border-radius: 16px;">
                <h3 style="color: var(--accent-color); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">${s.nombre_cientifico || 'Detalle'}</h3>
                <p><strong>Común:</strong> ${s.nombre_comun || 'N/A'}</p>
                <p><strong>Ubicación:</strong> ${s.estado_nombre || '-'}</p>
                <p><strong>Colector:</strong> ${s.colector_nombre || 'N/A'}</p>
            </div>
        `;
    }

    async handleAltaSubmit(e) {
        e.preventDefault();
        try {
            await this.model.createEspecimen(Object.fromEntries(new FormData(e.target)));
            await this.model.fetchEspecimenes();
            this.navigate('general');
        } catch (err) { alert('Error al guardar'); }
    }

    async handleModificarSubmit(e) {
        e.preventDefault();
        try {
            await this.model.updateEspecimen(this.selectedItem.id_especimen, Object.fromEntries(new FormData(e.target)));
            await this.model.fetchEspecimenes();
            this.navigate('general');
        } catch (err) { alert('Error al actualizar'); }
    }

    async handleBajaSubmit() {
        try {
            await this.model.deleteEspecimen(this.selectedItem.id_especimen);
            await this.model.fetchEspecimenes();
            this.navigate('general');
        } catch (err) { alert('Error al eliminar'); }
    }
}

window.EspecimenController = new EspecimenController();
