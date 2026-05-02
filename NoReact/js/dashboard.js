document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) { window.location.replace('../index.html'); return; }

    // 0. Check for permissions/status (Access Denied Modal)
    // If user is inactive (status 0) or has no modules assigned (mocking this for now)
    const hasNoModules = false; // This would be true if modulesData fetch returned empty
    if (user.status === 0 || hasNoModules) {
        if (window.AccessDeniedModal) {
            const modal = new window.AccessDeniedModal();
            modal.show();
            return; // Stop further initialization
        }
    }

    // 1. Fetch and inject sidebar component
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

    // 2. Query DOM elements (now they exist in the DOM)
    const sidebarAside = document.getElementById('sidebar-aside');
    const collapseBtn  = document.getElementById('sidebar-collapse-btn');
    const collapseIcon = document.getElementById('collapse-icon');
    const themeToggle  = document.getElementById('theme-toggle');
    const configBtn    = document.getElementById('config-btn');
    const configPanel  = document.getElementById('config-panel');
    const logoutBtn    = document.getElementById('logout-btn');
    const contentArea  = document.getElementById('content-area');
    const navModules   = document.getElementById('nav-modules-container');
    const navDashboard = document.getElementById('nav-dashboard');

    const modulesData = [
        { name:'Usuarios',              area:'Seguridad',      view:'usuarios' },
        { name:'Perfiles',              area:'Seguridad',      view:'perfiles' },
        { name:'Catalogos',             area:'Administrativo', view:'catalogos' },
        { name:'Aprobaciones',          area:'Administrativo', view:'aprobaciones' },
        { name:'Registro de Ejemplares',area:'Colección',      view:'especimenes' },
        { name:'Fototeca',              area:'Colección',      view:'fototeca' },
        { name:'Prestamos',             area:'Colección',      view:'prestamos' },
    ];

    const iconMap = { usuarios:'users', perfiles:'shield-check', catalogos:'book-open', aprobaciones:'clipboard-check', especimenes:'bug', fototeca:'camera', prestamos:'handshake' };

    // ── Sidebar collapse ──────────────────────────────────────────
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

    // ── Theme ─────────────────────────────────────────────────────
    applyTheme(localStorage.getItem('theme') || 'light');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    function applyTheme(t) {
        // Add no-transition class to body to prevent color animation
        document.body.classList.add('no-transition');
        
        document.body.classList.toggle('dark-mode', t === 'dark');
        if (themeToggle) {
            themeToggle.classList.toggle('is-dark', t === 'dark');
            themeToggle.classList.toggle('is-light', t !== 'dark');
        }
        localStorage.setItem('theme', t);
        lucide.createIcons();
        
        // Use a short timeout to remove the class after the DOM has updated
        setTimeout(() => {
            document.body.classList.remove('no-transition');
        }, 50);
    }

    // ── Config panel ──────────────────────────────────────────────
    if (configBtn && configPanel) {
        configBtn.addEventListener('click', e => {
            e.stopPropagation();
            const open = configPanel.style.display === 'flex';
            configPanel.style.display = open ? 'none' : 'flex';
            configBtn.classList.toggle('config-btn-active', !open);
        });
        
        // Prevent closing when clicking inside the panel
        configPanel.addEventListener('click', e => e.stopPropagation());
        document.addEventListener('click', e => {
            if (!configPanel.contains(e.target) && !configBtn.contains(e.target)) {
                configPanel.style.display = 'none';
                configBtn.classList.remove('config-btn-active');
            }
        });
    }

    // ── Scale select ──────────────────────────────────────────────
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
                
                // Apply scaling classes to html
                document.documentElement.classList.remove('scale-1-2', 'scale-1-4');
                if (val === '1.2') document.documentElement.classList.add('scale-1-2');
                if (val === '1.4') document.documentElement.classList.add('scale-1-4');
            });
        });
    }

    // ── Render sidebar modules ────────────────────────────────────
    if (navModules) {
        const perms = JSON.parse(localStorage.getItem('permissions') || '[]');
        
        // Filtramos los módulos: si el usuario tiene permisos para ese módulo (y no es SinAcceso/idProfile 5)
        // Nota: El backend ya filtra y solo envía los módulos donde el usuario tiene algo asignado.
        const allowedModules = modulesData.filter(m => {
            // El nombre en modulesData debe coincidir con el nombre en la DB (moduleName)
            // 'Registro de Ejemplares' en UI es 'Registro de Ejemplares' en DB
            return perms.some(p => p.moduleName === m.name);
        });

        const grouped = allowedModules.reduce((acc, m) => { (acc[m.area] = acc[m.area] || []).push(m); return acc; }, {});
        navModules.innerHTML = '';
        Object.entries(grouped).forEach(([area, mods]) => {
            const g = document.createElement('div');
            g.className = 'nav-group';
            g.innerHTML = `<div class="nav-section-header"><span class="nav-section-label nav-label">${area}</span></div><div class="nav-group-children"></div>`;
            const children = g.querySelector('.nav-group-children');
            mods.forEach(m => {
                const a = document.createElement('a');
                a.href = '#'; a.className = 'nav-item nav-child'; a.title = m.name;
                a.setAttribute('data-view', m.view);
                a.innerHTML = `<i data-lucide="${iconMap[m.view] || 'circle-dot'}"></i><span class="nav-label">${m.name}</span>`;
                a.onclick = e => { e.preventDefault(); setActive(a); loadView(m.view); };
                children.appendChild(a);
            });
            navModules.appendChild(g);
        });
    }
    lucide.createIcons();

    // ── Navigation helpers ────────────────────────────────────────
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
            prestamos: '../views/prestamos/prestamos.html'
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
            window.location.replace('../index.html'); 
        };
    }

    loadView('dashboard');
});
