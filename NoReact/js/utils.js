/**
 * Global utilities for the NoReact version of the Entomological Management System.
 */
class Utils {
    /**
     * Shows a toast notification using Bootstrap.
     * @param {string} message - The message to display.
     * @param {string} type - The type of toast: 'success', 'danger', 'warning', 'info'.
     */
    static showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '1100';
            document.body.appendChild(container);
        }

        const toastId = 'toast-' + Date.now();
        const iconMap = {
            success: 'check-circle',
            danger: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const html = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body d-flex align-items-center gap-2">
                        <i data-lucide="${iconMap[type] || 'info'}" style="width: 18px; height: 18px;"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        document.getElementById('toast-container').insertAdjacentHTML('beforeend', html);
        
        const toastEl = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        
        lucide.createIcons({
            attrs: {
                class: 'lucide-icon'
            },
            nameAttr: 'data-lucide',
            root: toastEl
        });
        
        toast.show();

        // Remove from DOM after hidden
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }

    /**
     * Validates an email address.
     * @param {string} email 
     * @returns {boolean}
     */
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    /**
     * Sets a loading state on a button.
     * @param {HTMLButtonElement} btn 
     * @param {boolean} isLoading 
     * @param {string} originalHtml 
     */
    static setButtonLoading(btn, isLoading, originalHtml = '') {
        if (!btn) return;
        if (isLoading) {
            btn.dataset.originalHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Cargando...`;
        } else {
            btn.disabled = false;
            btn.innerHTML = originalHtml || btn.dataset.originalHtml || btn.innerHTML;
        }
    }

    /**
     * Checks if the logged user has permission for a specific action in a module.
     * @param {string} moduleName - Name of the module as stored in DB.
     * @param {string} action - 'add', 'edit', 'delete', 'export'.
     * @returns {boolean}
     */
    static checkPermission(moduleName, action) {
        const perms = JSON.parse(localStorage.getItem('permissions') || '[]');
        const modulePerm = perms.find(p => p.moduleName === moduleName);
        if (!modulePerm) return false;

        const keyMap = {
            'add': 'key_add',
            'edit': 'key_edit',
            'delete': 'key_delete',
            'export': 'key_export'
        };

        const key = keyMap[action];
        return Boolean(Number(modulePerm[key]));
    }

    /** El usuario tiene el módulo asignado (aunque no tenga permiso de alta/edición). */
    static hasModuleAccess(moduleName) {
        const perms = JSON.parse(localStorage.getItem('permissions') || '[]');
        return Array.isArray(perms) && perms.some((p) => p.moduleName === moduleName);
    }
}

window.Utils = Utils;
