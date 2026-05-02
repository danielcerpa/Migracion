import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Search, Eye, EyeOff, X, CheckCircle, XCircle } from 'lucide-react';
import { getModulesAll, getProfilesAll } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import type { Usuario } from './types';
import CustomSelect from '../../components/CustomSelect';

interface ModificarProps {
  users: Usuario[];
  user: Usuario | null;
  onBack: () => void;
  onUpdate: (id: number, data: any) => void;
  onSelectUser: (user: Usuario) => void;
}

const Modificar: React.FC<ModificarProps> = ({ users, user, onBack, onUpdate, onSelectUser }) => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modsData, profsData] = await Promise.all([
          getModulesAll(),
          getProfilesAll()
        ]);
        setModules(modsData);
        setProfiles(profsData);
      } catch (err) {
        console.error('Error fetching data', err);
      }
    };
    fetchData();
  }, []);

  const profileOptions = profiles.map(p => ({
    value: String(p.idProfile),
    label: p.nickname,
    className: p.nickname === 'SinAcceso' ? 'text-danger' : ''
  }));

  // If user was selected outside this component (e.g., from General table), populate searchTerm initially
  useEffect(() => {
    if (user) {
      setSearchTerm(`${user.name} ${user.last_name || ''} ${user.second_last_name || ''}`.trim());
      setFormData({
        name: user.name,
        last_name: user.last_name,
        second_last_name: user.second_last_name || '',
        password: '',
        status: user.status ? '1' : '0'
      });
      if (user.permisos) {
        const perms: Record<number, string> = {};
        user.permisos.forEach(p => {
          perms[p.idModule] = String(p.idProfile);
        });
        setPermissions(perms);
      } else {
        setPermissions({});
      }
    } else {
      setSearchTerm('');
      setFormData({
        name: '',
        last_name: '',
        second_last_name: '',
        password: '',
        status: '1'
      });
      setPermissions({});
    }
  }, [user]);

  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    second_last_name: '',
    password: '',
    status: '1'
  });

  const [permissions, setPermissions] = useState<Record<number, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (moduleId: number, profileId: string) => {
    setPermissions(prev => ({ ...prev, [moduleId]: profileId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const formattedPermissions = Object.entries(permissions).map(([idModule, idProfile]) => ({
      idModule: Number(idModule),
      idProfile: Number(idProfile)
    }));
    const dataToSend: any = { ...formData, permisos: formattedPermissions };
    if (!dataToSend.password) delete dataToSend.password; // backend won't update password if empty
    onUpdate(user.idUser, dataToSend);
  };

  const filteredUsers = users.filter(u => {
    // Hide the active user to prevent self-editing
    if (currentUser?.id && u.idUser === currentUser.id) return false;
    
    if (searchTerm.trim() === '') return true;
    
    return u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (u.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           u.email.toLowerCase().includes(searchTerm.toLowerCase())
  });

  return (
    <div className="screen-container animate-slide-in">
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">Modificar Usuario</h2>
            <p className="screen-subtitle">
              {user ? `Editando perfil de: ${user.name} ${user.last_name || ''} ${user.second_last_name || ''}` : 'Busca y selecciona un usuario para editar'}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Descartar</button>
          <button type="submit" form="usuarios-mod-form" className="btn-primary with-icon" disabled={!user}>
            <ShieldCheck size={18} />
            Actualizar Cambios
          </button>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: '1.5rem', overflow: 'visible' }}>
        <div className="form-section" style={{ position: 'relative' }}>
          <label>Buscar Usuario a Modificar</label>
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
                  onSelectUser(null as any); 
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
                  onMouseDown={(e) => { // use onMouseDown to fire before onBlur
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

      <div className="form-container-split" style={{ opacity: user ? 1 : 0.5, pointerEvents: user ? 'auto' : 'none' }}>
        <form id="usuarios-mod-form" key={user?.idUser ?? 'empty'} className="split-layout-form" onSubmit={handleSubmit}>
          <div className="form-left-column">
            <div className="form-card">
              <div className="form-section">
                <h3 className="section-title">Información Personal</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre(s)</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Apellido Paterno</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Apellido Materno</label>
                    <input type="text" name="second_last_name" value={formData.second_last_name} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Email (Usuario)</label>
                    <input type="email" defaultValue={user?.email} disabled className="input-disabled" />
                  </div>
                  <div className="form-group full-width">
                    <label>Nueva Contraseña (dejar en blanco para no cambiar)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        autoComplete="new-password" 
                        type={showPassword ? 'text' : 'password'} 
                        name="password"
                        placeholder="••••••••" 
                        style={{ width: '100%', paddingRight: '2.5rem' }}
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                 
                </div>
              </div>
            </div>
          </div>

          <div className="form-right-column">
            <div className="form-card perms-card">
              <div className="form-section">
                <h3 className="section-title">Permisos por Módulo</h3>
                <p className="helper-text-form">Ajusta el nivel de acceso por herramienta.</p>
                
                <div className="permissions-table-wrapper mini-table">
                  <table className="permissions-dual-table">
                    <tbody>
                      {(() => {
                        const rows = [];
                        for (let i = 0; i < modules.length; i += 2) {
                          rows.push(modules.slice(i, i + 2));
                        }
                        return rows.map((row, idx) => (
                          <tr key={idx}>
                            {row.map(module => {
                              const currentPerm = user?.permisos?.find(p => p.idModule === module.idModule);
                              return (
                                <React.Fragment key={module.idModule}>
                                  <td className="module-label-cell">
                                    {module.name}
                                  </td>
                                  <td className="select-cell" style={{ position: 'relative', width: '130px', paddingRight: '1.5rem', paddingLeft: '1rem' }}>
                                    <CustomSelect
                                      compact
                                      value={permissions[module.idModule] || String(currentPerm?.idProfile || "5")}
                                      onChange={(val) => handlePermissionChange(module.idModule, val)}
                                      options={profileOptions}
                                    />
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

            <div className="form-card compact-summary-card" style={{ marginTop: '1rem' }}>
              <div className="form-section" style={{ marginBottom: 0 }}>
                <h3 className="section-title" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>Referencia de Perfiles</h3>
                <div className="mini-reference-table">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'center' }}>Perfil</th>
                        {profiles.length > 0 && Object.keys(profiles[0])
                          .filter(k => k.startsWith('key_'))
                          .map(key => {
                            const nameMap: Record<string, string> = {
                              'key_add': 'Alta',
                              'key_edit': 'Modificar',
                              'key_delete': 'Baja',
                              'key_export': 'Exportar'
                            };
                            const name = nameMap[key] || key.replace('key_', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                            return <th key={key}>{name}</th>;
                          })
                        }
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.filter(p => p.nickname !== 'SinAcceso').map(p => (
                        <tr key={p.idProfile}>
                          <td className="profile-name-cell">{p.nickname}</td>
                          {Object.keys(p)
                            .filter(k => k.startsWith('key_'))
                            .map(key => (
                              <td key={key}>
                                {Boolean((p as any)[key]) ? 
                                  <CheckCircle size={16} style={{ color: 'var(--success-color)' }} /> : 
                                  <XCircle size={16} style={{ color: '#EF4444' }} />
                                }
                              </td>
                            ))
                          }
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
