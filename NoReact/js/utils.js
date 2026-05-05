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
        const iconMap = {
            success: 'check-circle',
            danger: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const colorMap = {
            success: '#10B981', // Emerald 500
            danger: '#EF4444',  // Red 500
            warning: '#F59E0B', // Amber 500
            info: '#3B82F6'     // Blue 500
        };

        const icon = iconMap[type] || 'info';
        const color = colorMap[type] || colorMap.info;

        // Custom HTML for the toast
        const div = document.createElement('div');
        div.className = `toastify-content d-flex align-items-center justify-content-between`;
        div.style.gap = '12px';
        div.style.minWidth = '250px';

        div.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <i data-lucide="${icon}" style="width: 20px; height: 20px;"></i>
                <span style="font-weight: 500; font-size: 0.95rem;">${message}</span>
            </div>
        `;

        const toast = Toastify({
            node: div,
            duration: 4000,
            close: true,
            gravity: "bottom",
            position: "right",
            stopOnFocus: true,
            style: {
                background: color,
                borderRadius: "12px",
                padding: "12px 16px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                display: "flex",
                alignItems: "center"
            },
            onClick: function() {} // Callback after click
        }).showToast();

        // Create icons for the newly added toast
        // Toastify might take a bit to render or we can find the element
        // The toastify element is created but we need to find it in the DOM or it might be easier to just call lucide globally
        // but we want to be efficient. Toastify returns the instance but the element is internal.
        // Actually, Toastify .showToast() appends to body.
        setTimeout(() => {
            lucide.createIcons();
        }, 10);
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
        const perms = JSON.parse(sessionStorage.getItem('permissions') || '[]');
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
        const perms = JSON.parse(sessionStorage.getItem('permissions') || '[]');
        return Array.isArray(perms) && perms.some((p) => p.moduleName === moduleName);
    }
}

window.Utils = Utils;
