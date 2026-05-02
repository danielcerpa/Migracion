import React from 'react';
import { Shield, Briefcase, Archive, Settings, BookOpen, ArrowRight } from 'lucide-react';
import { startSystemTour } from '../components/useTour';
import '../styles/Controlpanel.css';

const ControlPanel: React.FC = () => {
  return (
    <div className="control-panel-container">
      <div className="control-panel-welcome">
        <h1 className="control-panel-title">
          Panel de Control (Provisional)
        </h1>
      </div>
    
      <div className="control-panel-card">
        <div className="control-panel-card-header">
          <div className="control-panel-icon-wrapper">
            <BookOpen size={24} />
          </div>
          <h2 className="control-panel-card-title">
            Guía de Inicio Rápido
          </h2>
        </div>
        <div className="control-panel-card-content">
          <ol className="control-panel-list">
            <li>Utiliza el menú lateral para navegar entre las diferentes áreas del sistema</li>
            <li>Haz clic en cada área para expandir y ver los módulos disponibles</li>
            <li>Selecciona un módulo específico para acceder a sus funcionalidades</li>
            <li>Usa el botón de tema en la parte superior para cambiar entre modo claro y oscuro, tiene un icono de sol y luna</li>
          </ol>
        </div>
      </div>

      <div className="control-panel-help-section">
        <div>
          <h3 className="control-panel-help-title">
            ¿Necesitas más ayuda?
          </h3>
          <p className="control-panel-help-text">
           Comienza el tour guiado del sistema para aprender a usarlo.
          </p>
        </div>
        <div className="control-panel-help-action">
          <button id="tour-btn" className="control-panel-help-button" onClick={startSystemTour}>
            Comenzar 
            <span className="control-panel-help-button-icon">
              <ArrowRight size={16} strokeWidth={2} />
            </span>
          </button>
        </div>
      </div>

      <div className="control-panel-section">

        <h2 className="control-panel-section-title">
          Áreas del Sistema
        </h2>
        <div className="control-panel-grid">
          <div className="control-panel-module-card module-security">
            <div className="control-panel-module-header">
              <div className="control-panel-icon-wrapper">
                <Shield size={24} strokeWidth={2} />
              </div>
              <h3 className="control-panel-module-title">
                Seguridad
              </h3>
            </div>
            <p className="control-panel-module-description">
              Gestión de usuarios, perfiles y permisos del sistema
            </p>
          </div>

          <div className="control-panel-module-card module-admin">
            <div className="control-panel-module-header">
              <div className="control-panel-icon-wrapper">
                <Briefcase size={24} strokeWidth={2} />
              </div>
              <h3 className="control-panel-module-title">
                Administrativo
              </h3>
            </div>
            <p className="control-panel-module-description">
              Administración de aprobaciones y catalogos
            </p>
          </div>

          <div className="control-panel-module-card module-collection">
            <div className="control-panel-module-header">
              <div className="control-panel-icon-wrapper">
                <Archive size={24} strokeWidth={2} />
              </div>
              <h3 className="control-panel-module-title">
                Colección
              </h3>
            </div>
            <p className="control-panel-module-description">
              Gestión de especímenes y base de datos entomológica
            </p>
          </div>

          <div className="control-panel-module-card module-system">
            <div className="control-panel-module-header">
              <div className="control-panel-icon-wrapper">
                <Settings size={24} strokeWidth={2} />
              </div>
              <h3 className="control-panel-module-title">
                Sistema
              </h3>
            </div>
            <p className="control-panel-module-description">
              Reportes del sistema general o por módulo
            </p>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ControlPanel;
