import React, { useState } from 'react';
import { ArrowLeft, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Perfil } from './types';

interface BajaProps {
  profiles: Perfil[];
  profile: Perfil | null;
  onBack: () => void;
  onDelete: (profileId: number) => void;
  onSelectProfile: (profile: Perfil) => void;
}

const Baja: React.FC<BajaProps> = ({ profiles, profile, onBack, onDelete, onSelectProfile }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirming, setConfirming] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setSearchTerm(profile.nickname);
      setConfirming(false);
    } else {
      setSearchTerm('');
    }
  }, [profile]);

  const filteredProfiles = profiles.filter(p => {
    // Hide the active user's profile to prevent self-deletion
    if (user?.profileId && p.idProfile === user.profileId) return false;
    
    if (searchTerm.trim() === '') return true;
    
    return p.nickname.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="screen-container animate-slide-in">
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">Dar de Baja Perfil</h2>
            <p className="screen-subtitle">
              {profile ? `Eliminar el perfil: ${profile.nickname}` : 'Busca y selecciona un perfil para eliminar'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button 
            type="button" 
            className="btn-danger-soft with-icon" 
            onClick={() => {
              if (profile && confirm('¿Estás seguro de inhabilitar este perfil de forma definitiva?')) {
                onDelete(profile.idProfile);
              }
            }} 
            disabled={!profile}
          >
            <Trash2 size={18} />
            Eliminar Perfil
          </button>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: '1.5rem', overflow: 'visible' }}>
        <div className="form-section" style={{ position: 'relative' }}>
          <label>Buscar Perfil a Eliminar</label>
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
              position: 'absolute', top: '100%', left: 0, right: 0, maxWidth: '600px', maxHeight: '200px',
              overflowY: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: '0.5rem', marginTop: '0.5rem', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {filteredProfiles.length > 0 ? filteredProfiles.map(p => (
                <div 
                  key={p.idProfile}
                  style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
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
                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>No se encontraron resultados</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="form-container-split" style={{ opacity: profile ? 1 : 0.5, pointerEvents: profile ? 'auto' : 'none' }}>
        <form key={profile?.idProfile ?? 'empty'} className="split-layout-form" onSubmit={(e) => { e.preventDefault(); }}>
          
          <div className="form-left-column">
            <fieldset disabled style={{ border: 'none', padding: 0, margin: 0, width: '100%' }}>
              <div className="form-card">
                <div className="form-section">
                  <h3 className="section-title">Información del Rol (Modo Lectura)</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Nombre del Perfil</label>
                      <input type="text" defaultValue={profile?.nickname || ''} />
                    </div>
                    <div className="form-group full-width">
                      <label>Descripción</label>
                      <textarea 
                        defaultValue={profile?.description || ''}
                        rows={5}
                        className="custom-textarea"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

          </div>

          <div className="form-right-column">
            <fieldset disabled style={{ border: 'none', padding: 0, margin: 0, width: '100%', height: '100%' }}>
              <div className="form-card perms-card">
                <div className="form-section">
                  <h3 className="section-title">Permisos Globales</h3>
                  <p className="helper-text-form">Los permisos actuales se muestran en modo visualización.</p>
                  
                  <div className="permissions-grid">
                    <div className="permission-toggle-item">
                      <div className="permission-info"><span className="permission-label">Agregar</span></div>
                      <input type="checkbox" defaultChecked={profile?.key_add || false} className="custom-checkbox" />
                    </div>
                    <div className="permission-toggle-item">
                      <div className="permission-info"><span className="permission-label">Editar</span></div>
                      <input type="checkbox" defaultChecked={profile?.key_edit || false} className="custom-checkbox" />
                    </div>
                    <div className="permission-toggle-item">
                      <div className="permission-info"><span className="permission-label">Eliminar</span></div>
                      <input type="checkbox" defaultChecked={profile?.key_delete || false} className="custom-checkbox" />
                    </div>
                    <div className="permission-toggle-item">
                      <div className="permission-info"><span className="permission-label">Exportar</span></div>
                      <input type="checkbox" defaultChecked={profile?.key_export || false} className="custom-checkbox" />
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Baja;
