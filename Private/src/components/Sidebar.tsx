import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Bug, 
  LogOut, 
  LayoutDashboard,
  Sun,
  Moon,
  Users,
  ShieldCheck,
  ClipboardCheck,
  BookOpen,
  Handshake,
  Camera,
  FileBarChart,
  CircleDot,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2
} from 'lucide-react';
import '../styles/Sidebar.css';
import '../styles/Tour.css';

import AccessDeniedModal from './AccessDeniedModal';
import CustomSelect from './CustomSelect';

interface Module {
  idModule: number;
  name: string;
  description: string;
  area: string;
  status: number;
}

interface GroupedModules {
  [area: string]: Module[];
}

const Sidebar: React.FC = () => {
  const { user, logout, setPermissions } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [modules, setModules] = useState<GroupedModules>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const [showRestrictedModal, setShowRestrictedModal] = useState(true);
  const [scale, setScale] = useState('1');
  
  const configRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configOpen && configRef.current && !configRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.driver-popover')) {
          setConfigOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [configOpen]);

  const handleScaleChange = (value: string) => {
    setScale(value);
    const num = parseFloat(value);
    const layout = document.querySelector<HTMLElement>('.app-layout');
    if (layout) {
      (layout.style as any).zoom = value;
      layout.style.height = `${(100 / num).toFixed(6)}vh`;
      layout.style.width = `${(100 / num).toFixed(6)}vw`;
    }

    // Añadir clase de escala al BODY para estilos CSS
    document.body.classList.remove('scale-1', 'scale-1-2', 'scale-1-4', 'scale-1-8');
    const scaleClass = `scale-${value.replace('.', '-')}`;
    document.body.classList.add(scaleClass);
  };

  useEffect(() => {
    const fetchModules = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/modules?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }
        const data: Module[] = await response.json();
        
        // Save full module+permission data to global auth context
        setPermissions(data as any);

        // Group the modules by area
        const grouped = data.reduce((acc, module) => {
          if (!acc[module.area]) {
            acc[module.area] = [];
          }
          acc[module.area].push(module);
          return acc;
        }, {} as GroupedModules);

        setModules(grouped);
      } catch (err: any) {
        console.error('Error fetching modules:', err);
        setModules({});
        setError(err.message || 'Error al cargar los módulos');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [user?.id, setPermissions]);


  const getModuleIcon = (name: string) => {
    // Normalizar para quitar acentos y facilitar la comparación
    const n = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (n.includes('usuario'))        return Users;
    if (n.includes('perfil'))         return ShieldCheck;
    if (n.includes('catalog'))        return BookOpen;
    if (n.includes('aprobaciones'))   return ClipboardCheck;
    if (n.includes('ejemplar'))       return Bug;
    if (n.includes('prestamo'))       return Handshake;
    if (n.includes('fotot'))          return Camera;
    if (n.includes('reporte'))        return FileBarChart;
    return CircleDot;
  };


  if (loading) return <aside className="sidebar">Fetching...</aside>;
  if (error) return <aside className="sidebar">Error: {error}</aside>;

  const hasNoAccess = Object.keys(modules).length === 0;

  if (hasNoAccess) {
      return (
          <>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h1 className="sidebar-title">
                            <span>Barra de Navegación</span>
                        </h1>
                        <div 
                            className={`theme-switch-wrapper ${theme === 'dark' ? 'is-dark' : 'is-light'}`}
                            onClick={toggleTheme}
                            title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                        >
                            <div className="theme-switch-track">
                                <div className="theme-switch-thumb"></div>
                                <Sun className="theme-icon icon-sun" size={14} strokeWidth={2.5}/>
                                <Moon className="theme-icon icon-moon" size={14} strokeWidth={2.5}/>
                            </div>
                        </div>
                    </div>
                    <p className="sidebar-subtitle">
                        Sin Acceso
                    </p>
                </div>
                
                <div className="sidebar-nav">
                </div>
                <div className="sidebar-footer">
                    <button
                        onClick={logout}
                        className="logout-btn"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
            {showRestrictedModal && (
                <AccessDeniedModal 
                    onClose={() => setShowRestrictedModal(false)} 
                    onLogout={logout} 
                />
            )}
          </>
      );
  }

  return (
    <div id="sidebar">
    <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div id="sidebar-header" className="sidebar-header">
        <div className="sidebar-header-title-row">
          <button id="sidebar-collapse-btn"
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expandir Barra de Navegación" : "Colapsar Barra de Navegación"}
          >
            {collapsed ? <PanelLeftOpen size={20} strokeWidth={2.5} /> : <PanelLeftClose size={20} strokeWidth={2.5} />}
          </button>
        </div>

        <NavLink
            id="nav-dashboard"
            to="/controlpanel"
            end
            className={({ isActive }) => `nav-item nav-item-dashboard ${isActive ? 'active' : ''}`}
            title={collapsed ? 'Panel de Control' : undefined}
        >
            <LayoutDashboard size={20} />
            <span className="nav-label">Panel de Control</span>
        </NavLink>
      </div>

      <nav className="sidebar-nav">




        {loading && <div style={{padding: '16px', fontSize: '0.9rem', color: '#666'}}>Cargando menú...</div>}
        
        {error && (
            <div style={{padding: '16px', fontSize: '0.85rem', color: '#EF4444'}}>
                <p style={{marginBottom: '8px'}}>Error cargando módulos</p>
                <button 
                    onClick={() => window.location.reload()} 
                    style={{
                        padding: '4px 8px', 
                        fontSize: '0.8rem', 
                        background: 'var(--bg-subtle)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Reintentar
                </button>
            </div>
        )}

        {!loading && !error && Object.entries(modules).map(([area, areaModules], idx) => {

          return (
            <div key={area} className="nav-group" id={idx === 0 ? 'nav-modules' : undefined}>
              <div className="nav-section-header">
                <span className="nav-section-label nav-label">
                  {area}
                </span>
              </div>
              
              <div className="nav-group-children">
                {areaModules.map(module => (
                  <NavLink
                    key={module.idModule}
                    to={(() => {
                      const n = module.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                      if (n.includes('usuario'))    return '/controlpanel/usuarios';
                      if (n.includes('perfil'))     return '/controlpanel/perfiles';
                      if (n.includes('fotot'))      return '/controlpanel/fototeca';
                      if (n.includes('catalog'))    return '/controlpanel/catalogos';
                      if (n.includes('aprobacion'))  return '/controlpanel/aprobaciones';
                      if (n.includes('ejemplar'))   return '/controlpanel/especimenes';
                      if (n.includes('verificaci')) return '/controlpanel/verificaciones';

                      if (n.includes('prestamo'))   return '/controlpanel/prestamos';
                      return `/controlpanel/provisional/${module.idModule}`;
                    })()}
                    className={({ isActive }) =>
                      `nav-item nav-child ${isActive ? 'active' : ''}`
                    }
                    title={module.name}
                  >
                    {(() => { const Icon = getModuleIcon(module.name); return <Icon size={20} />; })()}
                    <span className="nav-label">{module.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div id="sidebar-footer" className="sidebar-footer" ref={configRef}>

        {configOpen && (
          <div className="config-panel">
            <div className="config-panel-row">
              <span className="config-panel-label">Tema</span>
              <div 
                id="theme-toggle"
                className={`theme-switch-wrapper ${theme === 'dark' ? 'is-dark' : 'is-light'}`}
                onClick={toggleTheme}
                title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
              >
                <div className="theme-switch-track">
                  <div className="theme-switch-thumb"></div>
                  <Sun className="theme-icon icon-sun" size={14} strokeWidth={2.5}/>
                  <Moon className="theme-icon icon-moon" size={14} strokeWidth={2.5}/>
                </div>
              </div>
            </div>
            <div className="config-panel-row" id="config-size-interface">
              <span className="config-panel-label">Tamaño</span>
              <div className="font-size-select config-select" style={{ display: 'flex', alignItems: 'center', padding: '6px 10px' }}>
                <CustomSelect
                  compact
                  openUpwards
                  value={scale}
                  onChange={handleScaleChange}
                  options={[
                    { value: "1", label: "Normal" },
                    { value: "1.2", label: "Grande" },
                    { value: "1.4", label: "Muy Grande" },
                    { value: "1.8", label: "Enorme" }
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        <div className="footer-actions">
          <button id="config-btn"
            className={`sidebar-btn config-btn${configOpen ? ' config-btn-active' : ''}`}
            onClick={() => setConfigOpen(o => !o)}
            title={collapsed ? 'Configuración' : undefined}
          >
            <Settings2 size={20} />
            <span className="nav-label">Configuración</span>
          </button>
          <button id="logout-btn"
            onClick={logout}
            className="logout-btn"
            title={collapsed ? 'Cerrar Sesión' : undefined}
          >
            <LogOut size={20} />
            <span className="nav-label">Cerrar Sesión</span>
          </button>
        </div>

      </div>
    </aside>
    </div>
  );
};

export default Sidebar;
