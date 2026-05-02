document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('user')) {
        window.location.replace('views/dashboard.html');
        return;
    }

    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');
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
        errorMsg.style.display = 'none';

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
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.replace('views/dashboard.html');
            } else {
                // Manejar mock alternativo por si la API falla o la DB está vacía
                if ((email === 'admin@mail.com' || email === 'consultor@mail.com') && password === '123') {
                    const user = {
                        id_usuario: email === 'admin@mail.com' ? 1 : 2,
                        nombre: email === 'admin@mail.com' ? 'Admin' : 'Consultor',
                        apellido_paterno: 'Mock',
                        email: email,
                        nombre_perfil: email === 'admin@mail.com' ? 'Administrador' : 'Consultor'
                    };
                    localStorage.setItem('user', JSON.stringify(user));
                    window.location.replace('views/dashboard.html');
                } else {
                    errorMsg.textContent = data.error || 'Correo o contraseña incorrectos';
                    errorMsg.style.display = 'block';
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            // Fallback al mock si no hay servidor
            if ((email === 'admin@mail.com' || email === 'consultor@mail.com') && password === '123') {
                const user = {
                    id_usuario: email === 'admin@mail.com' ? 1 : 2,
                    nombre: email === 'admin@mail.com' ? 'Admin' : 'Consultor',
                    apellido_paterno: 'Mock',
                    email: email,
                    nombre_perfil: email === 'admin@mail.com' ? 'Administrador' : 'Consultor'
                };
                localStorage.setItem('user', JSON.stringify(user));
                window.location.replace('views/dashboard.html');
            } else {
                errorMsg.textContent = 'Error de conexión con el servidor.';
                errorMsg.style.display = 'block';
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Iniciar Sesión';
        }
    });
});
