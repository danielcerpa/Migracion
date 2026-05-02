document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) { window.location.replace('../index.html'); return; }

    const permsCheck = JSON.parse(localStorage.getItem('permissions') || '[]');
    const hasNoModules = !Array.isArray(permsCheck) || permsCheck.length === 0;
    if (user.status === 0 || hasNoModules) {
        if (window.AccessDeniedModal) {
            const modal = new window.AccessDeniedModal();
            modal.show();
            return;
        }
    }

    const sidebarContainer = document.getElementById('sidebar');
    try {
        const sidebarRes = await fetch(`../components/sidebar.html?v=${new Date().getTime()}`);
        if (!sidebarRes.ok) throw new Error('Failed to load sidebar');
        sidebarContainer.innerHTML = await sidebarRes.text();
    } catch (err) {
        console.error(err);
        sidebarContainer.innerHTML = '<div class="p-3 text-danger">Error cargando el menú lateral.</div>';
        return;
    }

    const sidebarAside = document.getElementById('sidebar-aside');
    const collapseBtn  = document.getElementById('sidebar-collapse-btn');
    const themeToggle  = document.getElementById('theme-toggle');
    const configBtn    = document.getElementById('config-btn');
    const configPanel  = document.getElementById('config-panel');
    const logoutBtn    = document.getElementById('logout-btn');
    const contentArea  = document.getElementById('content-area');
    const navModules   = document.getElementById('nav-modules-container');
    const navDashboard = document.getElementById('nav-dashboard');

    /** Lista estática (fallback) — nombres deben coincidir con la tabla `module` en v2.sql */
    const modulesStatic = [
        { name:'Usuarios',              area:'Seguridad',      view:'usuarios' },
        { name:'Perfiles',              area:'Seguridad',      view:'perfiles' },
        { name:'Catalogos',             area:'Administrativo', view:'catalogos' },
        { name:'Aprobaciones',          area:'Administrativo', view:'aprobaciones' },
        { name:'Registro de Ejemplares',area:'Colección',      view:'especimenes' },
        { name:'Fototeca',              area:'Colección',      view:'fototeca' },
        { name:'Prestamos',             area:'Colección',      view:'prestamos' },
        { name:'Reportes',              area:'Sistema',        view:'reportes' },
    ];

    const iconMap = {
        usuarios:'users', perfiles:'shield-check', catalogos:'book-open', aprobaciones:'clipboard-check',
        especimenes:'bug', fototeca:'camera', prestamos:'handshake', reportes:'bar-chart-2', provisional:'construction',
    };

    function normalizeModuleName(s) {
        return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Misma lógica de enrutado que `sistemas/Private/src/components/Sidebar.tsx` (NavLink).
     */
    function moduleRowToNav(m) {
        const name = m.name || '';
        const nn = normalizeModuleName(name);
        let view = 'provisional';
        if (nn.includes('usuario')) view = 'usuarios';
        else if (nn.includes('perfil')) view = 'perfiles';
        else if (nn.includes('catalog')) view = 'catalogos';
        else if (nn.includes('aprobacion')) view = 'aprobaciones';
        else if (nn.includes('ejemplar') || nn.includes('registro')) view = 'especimenes';
        else if (nn.includes('fotot')) view = 'fototeca';
        else if (nn.includes('prestamo')) view = 'prestamos';
        else if (nn.includes('verificacion')) view = 'provisional';
        else if (nn.includes('reporte')) view = 'reportes';
        return { name, area: m.area || 'Sistema', view, idModule: m.idModule };
    }

    async function fetchNavModulesForUser(uid) {
        try {
            const r = await fetch(`../api/modules.php?userId=${encodeURIComponent(uid)}`);
            if (!r.ok) return null;
            const rows = await r.json();
            if (!Array.isArray(rows) || rows.length === 0) return null;
            return rows.map(moduleRowToNav);
        } catch (_) {
            return null;
        }
    }

    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            sidebarAside.classList.toggle('sidebar-collapsed');
            const col = sidebarAside.classList.contains('sidebar-collapsed');
            const icon = document.getElementById('collapse-icon');
            if (icon) {
                icon.setAttribute('data-lucide', col ? 'panel-left-open' : 'panel-left-close');
                lucide.createIcons();
            }
        });
    }

    applyTheme(localStorage.getItem('theme') || 'light');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    function applyTheme(t) {
        document.body.classList.add('no-transition');
        document.body.classList.toggle('dark-mode', t === 'dark');
        if (themeToggle) {
            themeToggle.classList.toggle('is-dark', t === 'dark');
            themeToggle.classList.toggle('is-light', t !== 'dark');
        }
        localStorage.setItem('theme', t);
        lucide.createIcons();
        setTimeout(() => { document.body.classList.remove('no-transition'); }, 50);
    }

    if (configBtn && configPanel) {
        configBtn.addEventListener('click', e => {
            e.stopPropagation();
            const open = configPanel.style.display === 'flex';
            configPanel.style.display = open ? 'none' : 'flex';
            configBtn.classList.toggle('config-btn-active', !open);
        });
        configPanel.addEventListener('click', e => e.stopPropagation());
        document.addEventListener('click', e => {
            if (!configPanel.contains(e.target) && !configBtn.contains(e.target)) {
                configPanel.style.display = 'none';
                configBtn.classList.remove('config-btn-active');
            }
        });
    }

    const scaleTrigger = document.getElementById('scale-trigger');
    const scaleOptions = document.getElementById('scale-options');
    const scaleLabel   = document.getElementById('scale-current-label');
    if (scaleTrigger) {
        scaleTrigger.addEventListener('click', e => { e.stopPropagation(); scaleOptions.style.display = scaleOptions.style.display === 'block' ? 'none' : 'block'; });
        document.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const val = opt.dataset.value;
                document.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                scaleLabel.textContent = opt.textContent;
                scaleOptions.style.display = 'none';
                document.documentElement.classList.remove('scale-1-2', 'scale-1-4');
                if (val === '1.2') document.documentElement.classList.add('scale-1-2');
                if (val === '1.4') document.documentElement.classList.add('scale-1-4');
            });
        });
    }

    const perms = JSON.parse(localStorage.getItem('permissions') || '[]');
    const userId = user.id ?? user.idUser;
    let navModuleList = await fetchNavModulesForUser(userId);
    if (!navModuleList) {
        navModuleList = modulesStatic.filter(m => perms.some(p => p.moduleName === m.name));
    }

    if (navModules) {
        const grouped = navModuleList.reduce((acc, m) => {
            (acc[m.area] = acc[m.area] || []).push(m);
            return acc;
        }, {});
        navModules.innerHTML = '';
        Object.entries(grouped).forEach(([area, mods]) => {
            const g = document.createElement('div');
            g.className = 'nav-group';
            g.innerHTML = `<div class="nav-section-header"><span class="nav-section-label nav-label">${area}</span></div><div class="nav-group-children"></div>`;
            const children = g.querySelector('.nav-group-children');
            mods.forEach(m => {
                const a = document.createElement('a');
                a.href = '#';
                a.className = 'nav-item nav-child';
                a.title = m.name;
                a.setAttribute('data-view', m.view);
                a.setAttribute('data-module-name', m.name);
                a.innerHTML = `<i data-lucide="${iconMap[m.view] || 'circle-dot'}"></i><span class="nav-label">${m.name}</span>`;
                a.onclick = e => {
                    e.preventDefault();
                    sessionStorage.setItem('provisionalTitle', m.name);
                    setActive(a);
                    loadView(m.view);
                };
                children.appendChild(a);
            });
            navModules.appendChild(g);
        });
    }
    lucide.createIcons();

    function setActive(el) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        if (el) el.classList.add('active');
    }

    if (navDashboard) {
        navDashboard.onclick = e => { e.preventDefault(); setActive(navDashboard); loadView('dashboard'); };
    }

    async function loadView(view) {
        contentArea.innerHTML = '<div class="d-flex justify-content-center py-5"><div class="spinner-border text-success"></div></div>';

        const pathMap = {
            dashboard: '../views/dashboard/dashboard.html',
            usuarios: '../views/usuarios/usuarios.html',
            perfiles: '../views/perfiles/perfiles.html',
            catalogos: '../views/catalogos/catalogos.html',
            especimenes: '../views/especimenes/especimenes.html',
            aprobaciones: '../views/aprobaciones/aprobaciones.html',
            fototeca: '../views/fototeca/fototeca.html',
            prestamos: '../views/prestamos/prestamos.html',
            reportes: '../views/reportes/reportes.html',
            provisional: '../views/provisional/provisional.html',
        };

        const viewPath = pathMap[view];
        if (!viewPath) {
            contentArea.innerHTML = `<div class="text-center py-5"><h3>Módulo "${view}" no encontrado</h3></div>`;
            return;
        }

        try {
            const response = await fetch(viewPath);
            if (!response.ok) throw new Error('Network response was not ok');
            const html = await response.text();
            contentArea.innerHTML = html;
            lucide.createIcons();

            if (view === 'provisional') {
                const t = document.getElementById('provisional-module-title');
                if (t) t.textContent = sessionStorage.getItem('provisionalTitle') || 'Módulo';
            }

            if (view === 'usuarios' && window.UsuarioController) {
                window.UsuarioController.init();
            } else if (view === 'perfiles' && window.PerfilController) {
                window.PerfilController.init();
            } else if (view === 'catalogos' && window.CatalogoController) {
                window.CatalogoController.init();
            } else if (view === 'especimenes' && window.EspecimenController) {
                window.EspecimenController.init();
            } else if (view === 'fototeca' && window.FototecaController) {
                window.FototecaController.init();
            } else if (view === 'prestamos' && window.PrestamoController) {
                window.PrestamoController.init();
            } else if (view === 'aprobaciones' && window.AprobacionController) {
                window.AprobacionController.init();
            } else if (view === 'reportes' && window.ReporteController) {
                window.ReporteController.init();
            } else if (view === 'dashboard' && window.DashboardTutorial) {
                window.DashboardTutorial.init();
            }
        } catch (error) {
            contentArea.innerHTML = `<div class="text-center py-5 text-danger"><h3>Error cargando el módulo "${view}"</h3><p>${error.message}</p></div>`;
        }
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('user');
            localStorage.removeItem('permissions');
            window.location.replace('../index.html');
        };
    }

    loadView('dashboard');
});
