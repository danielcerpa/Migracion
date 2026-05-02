import React from 'react';
import { LogOut } from 'lucide-react';
import '../styles/AccessDeniedModal.css';

interface AccessDeniedModalProps {
    onClose: () => void;
    onLogout: () => void;
}

const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({ onLogout }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Acceso Denegado</h2>
                <p className="modal-description">
                    Sus permisos han sido eliminados. <br /><br />
                    <strong>Por favor, contáctese con su administrador.</strong>
                </p>

                <button
                    onClick={onLogout}
                    className="modal-button"
                >
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default AccessDeniedModal;
