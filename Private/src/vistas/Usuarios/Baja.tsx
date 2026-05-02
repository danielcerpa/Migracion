import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Trash2, X } from 'lucide-react';
import { getModulesAll } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Usuario } from './types';

interface BajaProps {
  users: Usuario[];
  selectedUser: Usuario | null;
  onBack: () => void;
  onBaja: (userId: number) => void;
  onSelectUser: (user: Usuario) => void;
}

const Baja: React.FC<BajaProps> = ({ users, selectedUser, onBack, onBaja, onSelectUser }) => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await getModulesAll();
        setModules(data);
      } catch (err) {
        console.error('Error fetching modules', err);
      }
    };
    fetchModules();
  }, []);

  React.useEffect(() => {
    if (selectedUser) {
      setSearchTerm(`${selectedUser.name} ${selectedUser.last_name || ''} ${selectedUser.second_last_name || ''}`.trim());
    } else {
      setSearchTerm('');
    }
  }, [selectedUser]);

  const filteredUsers = users.filter(u => {
    // Hide the active user to prevent self-deletion
    if (currentUser?.id && u.idUser === currentUser.id) return false;
    
    if (searchTerm.trim() === '') return true;
    
    return u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (u.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           u.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="screen-container animate-slide-in">
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">Dar de Baja Usuario</h2>
            <p className="screen-subtitle">
              {selectedUser ? `Eliminar perfil de: ${selectedUser.name} ${selectedUser.last_name || ''} ${selectedUser.second_last_name || ''}` : 'Busca y selecciona un usuario para dar de baja'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button 
            type="button" 
            className="btn-danger-soft with-icon" 
            onClick={() => {
              if (selectedUser && confirm('¿Estás seguro de inhabilitar a este usuario de forma definitiva?')) {
                onBaja(selectedUser.idUser);
              }
            }} 
            disabled={!selectedUser}
          >
            <Trash2 size={18} />
            Eliminar Usuario
          </button>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: '1.5rem', overflow: 'visible' }}>
        <div className="form-section" style={{ position: 'relative' }}>
          <label>Buscar Usuario a Eliminar</label>
          <div className="search-wrapper" style={{ marginTop: '0.5rem', width: '100%', maxWidth: '600px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, apellidos o email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {searchTerm && (
              <button 
                type="button" 
                className="btn-clear" 
                onClick={() => {
                  setSearchTerm('');
                  onSelectUser(null as any); // Reset selection
                  setShowDropdown(false);
                }}
                title="Limpiar búsqueda"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {showDropdown && (
            <div className="search-dropdown" style={{ maxWidth: '600px' }}>
              {filteredUsers.length > 0 ? filteredUsers.map(u => (
                <div 
                  key={u.idUser}
                  className="search-dropdown-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelectUser(u);
                    setSearchTerm(`${u.name} ${u.last_name || ''} ${u.second_last_name || ''}`.trim());
                    setShowDropdown(false);
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{u.name} {u.last_name} {u.second_last_name}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</span>
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

      <div className="form-container-split" style={{ opacity: selectedUser ? 1 : 0.5, pointerEvents: selectedUser ? 'auto' : 'none' }}>
        <form key={selectedUser?.idUser ?? 'empty'} className="split-layout-form" onSubmit={(e) => { e.preventDefault(); }}>
          <div className="form-left-column">
            
            <fieldset disabled style={{ border: 'none', padding: 0, margin: 0, width: '100%' }}>
              <div className="form-card">
                <div className="form-section">
                  <h3 className="section-title">Información Personal (Modo Lectura)</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nombre(s)</label>
                      <input type="text" defaultValue={selectedUser?.name} />
                    </div>
                    <div className="form-group">
                      <label>Apellido Paterno</label>
                      <input type="text" defaultValue={selectedUser?.last_name} />
                    </div>
                    <div className="form-group">
                      <label>Apellido Materno</label>
                      <input type="text" defaultValue={selectedUser?.second_last_name} />
                    </div>
                    <div className="form-group">
                      <label>Email (Usuario)</label>
                      <input type="email" defaultValue={selectedUser?.email} className="input-disabled" />
                    </div>
                    <div className="form-group full-width">
                      <label>Estado del Usuario</label>
                      <select defaultValue={selectedUser?.status ? 'true' : 'false'}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
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
                  <h3 className="section-title">Permisos por Módulo</h3>
                  <p className="helper-text-form">Los permisos actuales se muestran en modo visualización.</p>
                  
                  <div className="permissions-table-wrapper mini-table">
                    <table className="permissions-dual-table">
                      <thead>
                        <tr>
                          <th>Módulo</th>
                          <th>Perfil</th>
                          <th>Módulo</th>
                          <th>Perfil</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const rows = [];
                          for (let i = 0; i < modules.length; i += 2) {
                            rows.push(modules.slice(i, i + 2));
                          }
                          return rows.map((row, idx) => (
                            <tr key={idx}>
                              {row.map(module => {
                                const currentPerm = selectedUser?.permisos?.find((p: any) => p.idModule === module.idModule);
                                return (
                                  <React.Fragment key={module.idModule}>
                                    <td className="module-label-cell">
                                      {module.name}
                                    </td>
                                    <td className="select-cell">
                                      <select className="select-table-compact" defaultValue={currentPerm?.idProfile || "5"}>
                                        <option value="1">Admin</option>
                                        <option value="2">Editor</option>
                                        <option value="3">Capt.</option>
                                        <option value="4">Cons.</option>
                                        <option value="5">N/A</option>
                                      </select>
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                              {row.length === 1 && (
                                <>
                                  <td className="module-label-cell"></td>
                                  <td className="select-cell"></td>
                                </>
                              )}
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
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
