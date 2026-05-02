class AccessDeniedModal {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'access-denied-modal-wrapper';
        document.body.appendChild(this.container);
    }

    async show() {
        try {
            // Updated path to point to components folder from dashboard view context
            const response = await fetch('../components/AccessDeniedModal.html');
            if (!response.ok) throw new Error('Failed to load AccessDeniedModal template');
            
            this.container.innerHTML = await response.text();
            
            const modal = document.getElementById('access-denied-modal');
            const logoutBtn = document.getElementById('access-denied-logout');
            
            if (modal) {
                modal.style.display = 'flex';
                
                // Block any interaction with the rest of the page
                document.body.style.overflow = 'hidden';
                
                // Setup Logout
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('user');
                        localStorage.removeItem('permissions');
                        localStorage.removeItem('token');
                        window.location.replace('../index.html');
                    });
                }

                // Create icons for the modal
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        } catch (error) {
            console.error('Error showing AccessDeniedModal:', error);
            // Fallback: alert and logout
            alert('Acceso Denegado: Sus permisos han sido eliminados. Por favor, contáctese con su administrador.');
            localStorage.removeItem('user');
            localStorage.removeItem('permissions');
            window.location.replace('../index.html');
        }
    }
}

// Export for global use if needed
window.AccessDeniedModal = AccessDeniedModal;
