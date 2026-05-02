import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { getModulesAll, getProfilesAll } from '../../services/api';
import CustomSelect from '../../components/CustomSelect';

interface AltaProps {
  onBack: () => void;
  onSave: (data: any) => void;
}

const Alta: React.FC<AltaProps> = ({ onBack, onSave }) => {
  const [modules, setModules] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    second_last_name: '',
    email: '',
    password: ''
  });

  const [permissions, setPermissions] = useState<Record<number, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePermissionChange = (moduleId: number, profileId: string) => {
    setPermissions(prev => ({ ...prev, [moduleId]: profileId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPermissions = Object.entries(permissions).map(([idModule, idProfile]) => ({
      idModule: Number(idModule),
      idProfile: Number(idProfile)
    }));
    onSave({ ...formData, permisos: formattedPermissions });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modsData, profsData] = await Promise.all([
          getModulesAll(),
          getProfilesAll()
        ]);
        setModules(modsData);
        setProfiles(profsData);
        const initialPerms: Record<number, string> = {};
        
        // Find default profile (SinAcceso or last one) to set as default
        const sinAccesoProfile = profsData.find((p: any) => p.nickname === 'SinAcceso');
        const defaultProfileId = sinAccesoProfile ? String(sinAccesoProfile.idProfile) : String(profsData[profsData.length - 1]?.idProfile || '5');

        modsData.forEach((m: any) => {
          initialPerms[m.idModule] = defaultProfileId;
        });
        setPermissions(initialPerms);
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

  return (
    <div className="screen-container animate-slide-in">
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">Nuevo Usuario</h2>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button type="submit" form="alta-usuario-form" className="btn-primary with-icon"
            disabled={!formData.name.trim() || !formData.last_name.trim() || !formData.email.trim() || !formData.password.trim()}
          >
            <Save size={18} />
            Guardar Usuario
          </button>
        </div>
      </div>

      <div className="form-container-split">
        <form id="alta-usuario-form" className="split-layout-form" onSubmit={handleSubmit}>
          <div className="form-left-column">
            <div className="form-card">
              <div className="form-section">
                <h3 className="section-title">Información Personal</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre(s)</label>
                    <input type="text" name="name" placeholder="Ej. Juan" required value={formData.name} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Apellido Paterno</label>
                    <input type="text" name="last_name" placeholder="Ej. Pérez" required value={formData.last_name} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Apellido Materno</label>
                    <input type="text" name="second_last_name" placeholder="Ej. García" value={formData.second_last_name} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Email (Usuario)</label>
                    <input type="email" name="email" placeholder="usuario@mail.com" required value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="form-group full-width">
                    <label>Contraseña</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        name="password"
                        placeholder="••••••••" 
                        required 
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
                <p className="helper-text-form" style={{ marginBottom: '1.25rem' }}>Asigna el acceso para cada herramienta.</p>
                
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
                            {row.map(module => (
                              <React.Fragment key={module.idModule}>
                                <td className="module-label-cell">
                                  {module.name}
                                </td>
                                <td className="select-cell" style={{ position: 'relative', width: '130px', paddingRight: '1.5rem', paddingLeft: '1rem' }}>
                                  <CustomSelect
                                    compact
                                    value={permissions[module.idModule] || '5'}
                                    onChange={(val) => handlePermissionChange(module.idModule, val)}
                                    options={profileOptions}
                                  />
                                </td>
                              </React.Fragment>
                            ))}
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

export default Alta;
