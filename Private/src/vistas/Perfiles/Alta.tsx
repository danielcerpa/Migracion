import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { PartialPerfil } from './types';

interface AltaProps {
  onBack: () => void;
  onSave: (profile: PartialPerfil) => void;
}

const Alta: React.FC<AltaProps> = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState<PartialPerfil>({
    nickname: '',
    description: '',
    key_add: false,
    key_edit: false,
    key_delete: false,
    key_export: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleToggle = (key: keyof PartialPerfil) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="screen-container animate-slide-in">
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">Nuevo Perfil</h2>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button type="submit" form="alta-perfil-form" className="btn-primary with-icon"
            disabled={!formData.nickname?.trim()}
          >
            <Save size={18} />
            Guardar Perfil
          </button>
        </div>
      </div>

      <div className="form-container-split">
        <form id="alta-perfil-form" className="split-layout-form" onSubmit={handleSubmit}>
          <div className="form-left-column">
            <div className="form-card">
              <div className="form-section">
                <h3 className="section-title">Información del Rol</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nombre del Perfil (Nickname)</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Supervisor de Campo" 
                      required 
                      value={formData.nickname}
                      onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción detallada</label>
                    <textarea 
                      placeholder="Describe las responsabilidades de este perfil..." 
                      rows={5}
                      className="custom-textarea"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-right-column">
            <div className="form-card perms-card">
              <div className="form-section">
                <h3 className="section-title">Permisos Globales</h3>
                <p className="helper-text-form">Define las acciones maestros permitidas para este rol.</p>
                
                <div className="permissions-grid">
                  <div className="permission-toggle-item" onClick={() => handleToggle('key_add')}>
                    <div className="permission-info">
                      <span className="permission-label">Agregar</span>
                      <span className="permission-desc">Crear nuevos registros</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={Boolean(formData.key_add)} 
                      onChange={(e) => { e.stopPropagation(); handleToggle('key_add'); }} 
                    />
                  </div>

                  <div className="permission-toggle-item" onClick={() => handleToggle('key_edit')}>
                    <div className="permission-info">
                      <span className="permission-label">Editar</span>
                      <span className="permission-desc">Modificar existentes</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={Boolean(formData.key_edit)} 
                      onChange={(e) => { e.stopPropagation(); handleToggle('key_edit'); }} 
                    />
                  </div>

                  <div className="permission-toggle-item" onClick={() => handleToggle('key_delete')}>
                    <div className="permission-info">
                      <span className="permission-label">Eliminar</span>
                      <span className="permission-desc">Borrado lógico o físico</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={Boolean(formData.key_delete)} 
                      onChange={(e) => { e.stopPropagation(); handleToggle('key_delete'); }} 
                    />
                  </div>

                  <div className="permission-toggle-item" onClick={() => handleToggle('key_export')}>
                    <div className="permission-info">
                      <span className="permission-label">Exportar</span>
                      <span className="permission-desc">Descargas Excel/PDF</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={Boolean(formData.key_export)} 
                      onChange={(e) => { e.stopPropagation(); handleToggle('key_export'); }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Alta;
