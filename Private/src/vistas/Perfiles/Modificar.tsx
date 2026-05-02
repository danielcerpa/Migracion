import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Perfil } from './types';

interface ModificarProps {
  profiles: Perfil[];
  profile: Perfil | null;
  onBack: () => void;
  onUpdate: (profileId: number, profileData: Partial<Perfil>) => void;
  onSelectProfile: (profile: Perfil) => void;
}

const Modificar: React.FC<ModificarProps> = ({ profiles, profile, onBack, onUpdate, onSelectProfile }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState<Partial<Perfil>>({});

  React.useEffect(() => {
    if (profile) {
      setSearchTerm(profile.nickname);
      setFormData({
        nickname: profile.nickname,
        description: profile.description,
        key_add: Boolean(profile.key_add),
        key_edit: Boolean(profile.key_edit),
        key_delete: Boolean(profile.key_delete),
        key_export: Boolean(profile.key_export),
      });
    } else {
      setSearchTerm('');
      setFormData({});
    }
  }, [profile]);

  const filteredProfiles = profiles.filter(p => {
    // Hide the active user's profile to prevent self-editing
    if (user?.profileId && p.idProfile === user.profileId) return false;
    
    if (searchTerm.trim() === '') return true;
    
    return p.nickname.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      onUpdate(profile.idProfile, formData);
    }
  };

  const handleToggle = (key: keyof Perfil) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key as keyof Partial<Perfil>]
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
            <h2 className="screen-title">Modificar Perfil</h2>
            <p className="screen-subtitle">
              {profile ? `Actualiza los permisos de: ${profile.nickname}` : 'Busca y selecciona un perfil para editar'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button type="submit" form="perfiles-mod-form" className="btn-primary with-icon" disabled={!profile}>
            <ShieldCheck size={18} />
            Actualizar Perfil
          </button>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: '1.5rem', overflow: 'visible' }}>
        <div className="form-section" style={{ position: 'relative' }}>
          <label>Buscar Perfil a Modificar</label>
          <div className="search-wrapper" style={{ marginTop: '0.5rem', width: '100%', maxWidth: '600px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
          </div>
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              maxWidth: '600px',
              maxHeight: '200px',
              overflowY: 'auto',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              marginTop: '0.5rem',
              zIndex: 1000,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {filteredProfiles.length > 0 ? filteredProfiles.map(p => (
                <div 
                  key={p.idProfile}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectProfile(p);
                    setSearchTerm(p.nickname);
                    setShowDropdown(false);
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{p.nickname}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.description}</span>
                </div>
              )) : (
                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                  No se encontraron resultados
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="form-container-split" style={{ opacity: profile ? 1 : 0.5, pointerEvents: profile ? 'auto' : 'none' }}>
        <form id="perfiles-mod-form" key={profile?.idProfile ?? 'empty'} className="split-layout-form" onSubmit={handleSubmit}>
          <div className="form-left-column">
            <div className="form-card">
              <div className="form-section">
                <h3 className="section-title">Información del Rol</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nombre del Perfil</label>
                    <input 
                      type="text" 
                      value={formData.nickname || ''} 
                      onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción</label>
                    <textarea 
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={5}
                      className="custom-textarea"
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
                <p className="helper-text-form">Ajusta las capacidades maestras de este rol.</p>
                
                <div className="permissions-grid">
                  <div className="permission-toggle-item" onClick={() => handleToggle('key_add')}>
                    <div className="permission-info">
                      <span className="permission-label">Agregar</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={Boolean(formData.key_add)} 
                      className="custom-checkbox" 
                      onChange={(e) => { e.stopPropagation(); handleToggle('key_add'); }} 
                    />
                  </div>

                  <div className="permission-toggle-item" onClick={() => handleToggle('key_edit')}>
                    <div className="permission-info">
                      <span className="permission-label">Editar</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={Boolean(formData.key_edit)} 
                      className="custom-checkbox" 
                      onChange={(e) => { e.stopPropagation(); handleToggle('key_edit'); }} 
                    />
                  </div>

                  <div className="permission-toggle-item" onClick={() => handleToggle('key_delete')}>
                    <div className="permission-info">
                      <span className="permission-label">Eliminar</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={Boolean(formData.key_delete)} 
                      className="custom-checkbox" 
                      onChange={(e) => { e.stopPropagation(); handleToggle('key_delete'); }} 
                    />
                  </div>

                  <div className="permission-toggle-item" onClick={() => handleToggle('key_export')}>
                    <div className="permission-info">
                      <span className="permission-label">Exportar</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={Boolean(formData.key_export)} 
                      className="custom-checkbox" 
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

export default Modificar;
