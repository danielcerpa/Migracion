import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Globe, MapPin, Building2, Trees, 
  UserRound, Leaf, Layers, GitBranch, 
  Tag, Users, Microscope, Hash, Library, BookOpen
} from 'lucide-react';
import General from './General';
import Alta from './Alta';
import Modificar from './Modificar';
import Baja from './Baja';
import CatalogDashboard from './CatalogDashboard';
import type {
  CatalogSection, ViewType, CatalogEntity
} from './types'; 
import { useAuth, type UserPermission } from '../../context/AuthContext';
import '../../styles/Catalogos.css';

const TABS: { key: CatalogSection; label: string; icon: React.ElementType }[] = [
  { key: 'pais',      label: 'País',               icon: Globe      },
  { key: 'estado',    label: 'Estado',             icon: MapPin     },
  { key: 'municipio', label: 'Municipio',          icon: Building2  },
  { key: 'localidad', label: 'Localidad',          icon: Trees      },
  { key: 'orden',      label: 'Orden',              icon: Layers     },
  { key: 'familia',    label: 'Familia',            icon: GitBranch  },
  { key: 'subfamilia', label: 'Subfamilia',         icon: GitBranch  },
  { key: 'tribu',      label: 'Tribu',              icon: Tag        },
  { key: 'genero',     label: 'Género',             icon: Tag        },
  { key: 'especie',    label: 'Especie',            icon: Tag        },
  { key: 'tipo',       label: 'Tipo',               icon: Hash       },
  { key: 'colector',     label: 'Colector',           icon: UserRound  },
  { key: 'determinador', label: 'Determinador',       icon: Users      },
  { key: 'planta',    label: 'Planta',             icon: Leaf       },
  { key: 'organismo', label: 'Organismo',          icon: Microscope },
  { key: 'coleccion', label: 'Colección',          icon: Library    },
  { key: 'cita',      label: 'Cita Bib.',          icon: BookOpen   }
];

const ENDPOINT: Record<CatalogSection, string> = {
  pais:      '/api/catalogos/paises',
  estado:    '/api/catalogos/estados',
  municipio: '/api/catalogos/municipios',
  localidad: '/api/catalogos/localidades',
  orden:     '/api/catalogos/ordenes',
  familia:   '/api/catalogos/familias',
  subfamilia:'/api/catalogos/subfamilias',
  tribu:     '/api/catalogos/tribus',
  genero:    '/api/catalogos/generos',
  especie:   '/api/catalogos/especies',
  tipo:      '/api/catalogos/tipos',
  colector:  '/api/catalogos/colectores',
  determinador: '/api/catalogos/determinadores',
  planta:    '/api/catalogos/plantas',
  organismo: '/api/catalogos/organismos',
  coleccion: '/api/catalogos/colecciones',
  cita:      '/api/catalogos/citas' 
};

const Catalogos: React.FC = () => {
  const { permissions } = useAuth();
  const [section, setSection] = useState<CatalogSection>('pais');
  const [view, setView]       = useState<ViewType>('dashboard');
  const [items, setItems]     = useState<CatalogEntity[]>([]);
  const [parentItems, setParentItems] = useState<CatalogEntity[]>([]);
  const [selected, setSelected] = useState<CatalogEntity | null>(null);
  const [loading, setLoading]   = useState(false);

  const PARENT_SECTION: Partial<Record<CatalogSection, CatalogSection>> = {
    estado: 'pais',
    municipio: 'estado',
    localidad: 'municipio',
    familia: 'orden',
    subfamilia: 'familia',
    tribu: 'subfamilia',
    genero: 'tribu',
    especie: 'genero',
  };

  const modulePerms = permissions.find((p: UserPermission) => p.name.toLowerCase().includes('catalog')) || {
    key_add: 0,
    key_edit: 0,
    key_delete: 0,
    key_export: 0
  };

  useEffect(() => {
    if (view !== 'dashboard') {
      fetchData();
    }
  }, [section, view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [fetch(ENDPOINT[section]).then(r => r.json())];
      
      const parentSec = PARENT_SECTION[section];
      if ((view === 'alta' || view === 'modificar') && parentSec) {
        promises.push(fetch(ENDPOINT[parentSec]).then(r => r.json()));
      }

      const results = await Promise.all(promises);
      setItems(results[0]);
      if (results[1]) {
        setParentItems(results[1].filter((item: any) => item.status !== 0 && item.status !== false && item.status !== '0'));
      } else {
        setParentItems([]);
      }

    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (s: CatalogSection) => {
    setSection(s);
    setView('general');
    setSelected(null);
  };

  const handleNavigate = (v: 'alta' | 'modificar' | 'baja', item?: CatalogEntity) => {
    if (item) setSelected(item);
    else setSelected(null);
    setView(v);
  };

  const goBackToGeneral = () => {
    setView('general');
    setSelected(null);
  };

  const goToDashboard = () => {
    setView('dashboard');
    setSelected(null);
  };

  const handleAlta = async (data: Partial<CatalogEntity>) => {
    try {
      const res = await fetch(ENDPOINT[section], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchData();
        setView('general');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModificar = async (data: Partial<CatalogEntity>) => {
    const idKey = section === 'organismo' ? 'idOrganismo' : 
                 `id${section.charAt(0).toUpperCase()}${section.slice(1)}`;
    const id = (data as Record<string, number>)[idKey];
    
    // Create a clean copy to avoid sending joined/virtual columns to the database
    const payload = { ...data };
    delete (payload as any).nombrePais;
    delete (payload as any).nombreEstado;
    delete (payload as any).nombreMunicipio;
    delete (payload as any).nombreOrden;
    delete (payload as any).nombreFamilia;
    delete (payload as any).nombreSubfamilia;
    delete (payload as any).nombreTribu;
    delete (payload as any).nombreGenero;
    delete (payload as any).nombrePadre;
    
    try {
      const res = await fetch(`${ENDPOINT[section]}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchData();
        setView('general');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBaja = async (id: number) => {
    try {
      const res = await fetch(`${ENDPOINT[section]}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        setView('general');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sectionLabel = TABS.find(t => t.key === section)?.label ?? '';
  const viewLabel: Record<ViewType, string> = {
    dashboard: 'Panel',
    general: '',
    alta: 'Alta',
    modificar: 'Modificar',
    baja: 'Baja'
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <CatalogDashboard onSelect={handleSectionChange} />;
      case 'general':
        return (
          <General
            section={section}
            items={items}
            onNavigate={handleNavigate}
            onBack={goToDashboard}
            modulePerms={modulePerms}
          />
        );
      case 'alta':
        return (
          <Alta
            section={section}
            items={items}
            parentItems={parentItems}
            onBack={goBackToGeneral}
            onSave={handleAlta}
          />
        );
      case 'modificar':
        return (
          <Modificar
            section={section}
            items={items}
            parentItems={parentItems}
            item={selected}
            onBack={goBackToGeneral}
            onSelect={setSelected}
            onSave={handleModificar}
          />
        );
      case 'baja':
        return (
          <Baja
            section={section}
            items={items}
            item={selected}
            onBack={goBackToGeneral}
            onSelect={setSelected}
            onBaja={handleBaja}
          />
        );
    }
  };

  return (
    <div className="catalogos-module">
      {/* ── Migas de Pan ── */}
      {view !== 'dashboard' && (
        <div className="module-breadcrumb" style={{ marginTop: '1rem' }}>
          <span onClick={goToDashboard} className="breadcrumb-root">Catálogos</span>
          <ChevronRight size={14} />
          <span onClick={goBackToGeneral}>{sectionLabel}</span>
          {view !== 'general' && (
            <>
              <ChevronRight size={14} />
              <span className="current-crumb">{viewLabel[view]}</span>
            </>
          )}
        </div>
      )}

      {/* ── Área de Contenido ── */}
      <div className="module-screen">
        {loading && view === 'general' ? (
          <div className="catalog-loading">Cargando datos...</div>
        ) : renderContent() }
      </div>
    </div>
  );
};

export default Catalogos;
