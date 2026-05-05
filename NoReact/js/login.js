/** Permisos de demostración si el login cae en modo mock (misma forma que login.php). */
const MOCK_DEMO_MODULES = ['Usuarios', 'Perfiles', 'Catalogos', 'Aprobaciones', 'Registro de Ejemplares', 'Fototeca', 'Prestamos', 'Reportes'];

function buildMockPermissions(isAdmin) {
    return MOCK_DEMO_MODULES.map((moduleName) => ({
        moduleName,
        key_add: 1,
        key_edit: 1,
        key_delete: isAdmin ? 1 : 0,
        key_export: isAdmin ? 1 : 1,
    }));
}

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('user')) {
        window.location.replace('views/dashboard.html');
        return;
    }

    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const togglePassBtn = document.getElementById('toggle-password');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Theme Toggle Logic
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        updateThemeIcon('sun');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.add('no-transition');
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark ? 'sun' : 'moon');
        
        setTimeout(() => {
            body.classList.remove('no-transition');
        }, 50);
    });

    function updateThemeIcon(iconName) {
        const icon = document.getElementById('theme-icon');
        icon.setAttribute('data-lucide', iconName);
        lucide.createIcons();
    }

    // Password Toggle Logic
    togglePassBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        const icon = document.getElementById('eye-icon');
        icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
        lucide.createIcons();
    });

    // Char Counters
    emailInput.addEventListener('input', () => {
        document.getElementById('email-count').textContent = `${emailInput.value.length}/150`;
    });

    passwordInput.addEventListener('input', () => {
        document.getElementById('pass-count').textContent = `${passwordInput.value.length}/64`;
    });

    // Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;
        const submitBtn = loginForm.querySelector('.submit-btn');

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Iniciando...';

            const response = await fetch('api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Autenticación exitosa
                sessionStorage.setItem('user', JSON.stringify(data.user));
                sessionStorage.setItem('permissions', JSON.stringify(data.permissions || []));
                window.location.replace('views/dashboard.html');
            } else {
                // Manejar mock por si la API responde con error pero es cuenta de demo (opcional, dependiendo de si quieres que el API mande)
                // Pero siguiendo la instrucción de "separar", verificamos los datos ingresados
                const isDemoEmail = (email === 'admin@mail.com' || email === 'consultor@mail.com');
                
                if (isDemoEmail && password === '123') {
                    const isAdmin = email === 'admin@mail.com';
                    const user = { id: isAdmin ? 1 : 2, name: isAdmin ? 'Admin' : 'Consultor', email, status: 1 };
                    sessionStorage.setItem('user', JSON.stringify(user));
                    sessionStorage.setItem('permissions', JSON.stringify(buildMockPermissions(isAdmin)));
                    window.location.replace('views/dashboard.html');
                } else if (!isDemoEmail) {
                    window.Utils.showToast('Correo no encontrado', 'danger');
                } else {
                    window.Utils.showToast('Contraseña incorrecta', 'danger');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            // Fallback al mock si no hay servidor (separado)
            const isDemoEmail = (email === 'admin@mail.com' || email === 'consultor@mail.com');
            
            if (isDemoEmail && password === '123') {
                const isAdmin = email === 'admin@mail.com';
                const user = { id: isAdmin ? 1 : 2, name: isAdmin ? 'Admin' : 'Consultor', email, status: 1 };
                sessionStorage.setItem('user', JSON.stringify(user));
                sessionStorage.setItem('permissions', JSON.stringify(buildMockPermissions(isAdmin)));
                window.location.replace('views/dashboard.html');
            } else if (!isDemoEmail) {
                window.Utils.showToast('Correo no encontrado', 'danger');
            } else if (isDemoEmail && password !== '123') {
                window.Utils.showToast('Contraseña incorrecta', 'danger');
            } else {
                window.Utils.showToast('Error de conexión con el servidor.', 'danger');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Iniciar Sesión';
        }
    });
});
