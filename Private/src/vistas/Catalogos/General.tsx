import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Pencil, Trash2, ArrowLeft, ChevronLeft, ChevronRight,
  Globe, MapPin, Building2, Trees, UserRound, Leaf, BookOpen,
  Layers, GitBranch, Tag, Users, Microscope, Hash, Library
} from 'lucide-react'; 
import type { 
  CatalogSection, CatalogEntity, 
  Pais, Estado, Municipio, Localidad, 
  Orden, Familia, Subfamilia, Tribu, Genero, Especie, Tipo,
  Colector, Determinador, Planta, Organismo, Coleccion, Cita 
} from './types';

const SECTION_CONFIG: Record<CatalogSection, {
  label: string;
  icon: React.ElementType;
  columns: string[];
  emptyMsg: string;
}> = {
  pais:      { label: 'País',               icon: Globe,       columns: ['ID', 'Nombre', 'Código', 'Estado'],                emptyMsg: 'No hay países registrados.' },
  estado:    { label: 'Estado',             icon: MapPin,      columns: ['ID', 'País', 'Nombre', 'Estado'],                  emptyMsg: 'No hay estados registrados.' },
  municipio: { label: 'Municipio',          icon: Building2,   columns: ['ID', 'Estado', 'Nombre', 'Estado'],                emptyMsg: 'No hay municipios registrados.' },
  localidad: { label: 'Localidad',          icon: Trees,       columns: ['ID', 'Municipio', 'Nombre', 'Latitud', 'Longitud', 'Altitud', 'Estado'], emptyMsg: 'No hay localidades registradas.' },
  
  orden:      { label: 'Orden',              icon: Layers,      columns: ['ID', 'Nombre', 'Estado'],                          emptyMsg: 'No hay órdenes registrados.' },
  familia:    { label: 'Familia',            icon: GitBranch,   columns: ['ID', 'Orden', 'Nombre', 'Estado'],                 emptyMsg: 'No hay familias registradas.' },
  subfamilia: { label: 'Subfamilia',         icon: GitBranch,   columns: ['ID', 'Familia', 'Nombre', 'Estado'],                emptyMsg: 'No hay subfamilias registradas.' },
  tribu:      { label: 'Tribu',              icon: Tag,         columns: ['ID', 'Subfamilia', 'Nombre', 'Estado'],             emptyMsg: 'No hay tribus registradas.' },
  genero:     { label: 'Género',             icon: Tag,         columns: ['ID', 'Tribu', 'Nombre', 'Estado'],                  emptyMsg: 'No hay géneros registrados.' },
  especie:    { label: 'Especie',            icon: Tag,         columns: ['ID', 'Género', 'Nombre', 'Subespecie', 'Estado'],   emptyMsg: 'No hay especies registradas.' },
  tipo:       { label: 'Tipo',               icon: Hash,        columns: ['ID', 'Nombre', 'Estado'],                          emptyMsg: 'No hay tipos registrados.' },

  colector:     { label: 'Colector',           icon: UserRound,   columns: ['ID', 'Nombre', 'Apellidos', 'Correo', 'Institución', 'Estado'], emptyMsg: 'No hay colectores registrados.' },
  determinador: { label: 'Determinador',       icon: Users,       columns: ['ID', 'Nombre', 'Apellidos', 'Correo', 'Institución', 'Estado'], emptyMsg: 'No hay determinadores registrados.' },

  planta:    { label: 'Planta / Hospedero', icon: Leaf,        columns: ['ID', 'F. Botánica', 'Nombre Científico', 'Nombre Común', 'Estado'], emptyMsg: 'No hay plantas registradas.' },
  organismo: { label: 'Org. Hospedero',     icon: Microscope,  columns: ['ID', 'F. Hospedera', 'Nombre Organismo', 'Estado'],                 emptyMsg: 'No hay organismos registrados.' },
  coleccion: { label: 'Colección',          icon: Library,     columns: ['ID', 'Acrónimo', 'Institución', 'Estado'],                          emptyMsg: 'No hay colecciones registradas.' },
  cita:      { label: 'Cita Bib.',          icon: BookOpen,    columns: ['ID', 'Título', 'Autores', 'Revista', 'Volumen', 'Páginas', 'Año', 'Estado'],                         emptyMsg: 'No hay citas registradas.' },
};

function renderRow(
  section: CatalogSection,
  item: CatalogEntity
) {
  const badge = (status: boolean) => (
    <span className={`catalog-status-badge ${status ? 'activo' : 'inactivo'}`}>
      {status ? 'Activo' : 'Inactivo'}
    </span>
  );

  if (section === 'pais') {
    const p = item as Pais;
    return <>
      <td className="td-id">#{p.idPais}</td>
      <td className="td-name">{p.nombre}</td>
      <td><code className="catalog-code">{p.codigo || '—'}</code></td>
      <td>{badge(p.status)}</td>
    </>;
  }
  if (section === 'estado') {
    const e = item as Estado;
    return <>
      <td className="td-id">#{e.idEstado}</td>
      <td className="text-muted-small">{e.nombrePais || `#${e.idPais}`}</td>
      <td className="td-name">{e.nombre}</td>
      <td>{badge(e.status)}</td>
    </>;
  }
  if (section === 'municipio') {
    const m = item as Municipio;
    return <>
      <td className="td-id">#{m.idMunicipio}</td>
      <td className="text-muted-small">{m.nombreEstado || `#${m.idEstado}`}</td>
      <td className="td-name">{m.nombre}</td>
      <td>{badge(m.status)}</td>
    </>;
  }
  if (section === 'localidad') {
    const l = item as Localidad;
    return <>
      <td className="td-id">#{l.idLocalidad}</td>
      <td className="text-muted-small">{l.nombreMunicipio || `#${l.idMunicipio}`}</td>
      <td className="td-name">{l.nombre}</td>
      <td><code className="catalog-code">{l.latitud || '—'}</code></td>
      <td><code className="catalog-code">{l.longitud || '—'}</code></td>
      <td><code className="catalog-code">{l.altitud || '—'}</code></td>
      <td>{badge(l.status)}</td>
    </>;
  }
  if (section === 'orden') {
    const o = item as Orden;
    return <>
      <td className="td-id">#{o.idOrden}</td>
      <td className="td-name">{o.nombre}</td>
      <td>{badge(o.status)}</td>
    </>;
  }
  if (section === 'familia') {
    const f = item as Familia;
    return <>
      <td className="td-id">#{f.idFamilia}</td>
      <td className="text-muted-small">{f.nombreOrden || `#${f.idOrden}`}</td>
      <td className="td-name">{f.nombre}</td>
      <td>{badge(f.status)}</td>
    </>;
  }
  if (section === 'subfamilia') {
    const s = item as Subfamilia;
    return <>
      <td className="td-id">#{s.idSubfamilia}</td>
      <td className="text-muted-small">{s.nombreFamilia || `#${s.idFamilia}`}</td>
      <td className="td-name">{s.nombre}</td>
      <td>{badge(s.status)}</td>
    </>;
  }
  if (section === 'tribu') {
    const t = item as Tribu;
    return <>
      <td className="td-id">#{t.idTribu}</td>
      <td className="text-muted-small">{t.nombreSubfamilia || `#${t.idSubfamilia}`}</td>
      <td className="td-name">{t.nombre}</td>
      <td>{badge(t.status)}</td>
    </>;
  }
  if (section === 'genero') {
    const g = item as Genero;
    return <>
      <td className="td-id">#{g.idGenero}</td>
      <td className="text-muted-small">{g.nombreTribu || `#${g.idTribu}`}</td>
      <td className="td-name">{g.nombre}</td>
      <td>{badge(g.status)}</td>
    </>;
  }
  if (section === 'especie') {
    const e = item as Especie;
    return <>
      <td className="td-id">#{e.idEspecie}</td>
      <td className="text-muted-small">{e.nombreGenero || `#${e.idGenero}`}</td>
      <td className="td-name">{e.nombre}</td>
      <td><em>{e.subespecie || '—'}</em></td>
      <td>{badge(e.status)}</td>
    </>;
  }
  if (section === 'tipo') {
    const t = item as Tipo;
    return <>
      <td className="td-id">#{t.idTipo}</td>
      <td className="td-name">{t.nombre}</td>
      <td>{badge(t.status)}</td>
    </>;
  }
  if (section === 'colector' || section === 'determinador') {
    const c = item as Colector | Determinador;
    const id = section === 'colector' ? (c as Colector).idColector : (c as Determinador).idDeterminador;
    return <>
      <td className="td-id">#{id}</td>
      <td className="td-name">{c.nombre}</td>
      <td>{`${c.apellido_paterno || ''} ${c.apellido_materno || ''}`}</td>
      <td><span className="text-muted-small">{c.correo || '—'}</span></td>
      <td><span className="text-muted-small">{c.institucion || '—'}</span></td>
      <td>{badge(c.status)}</td>
    </>;
  }
  if (section === 'planta') {
    const p = item as Planta;
    return <>
      <td className="td-id">#{p.idPlanta}</td>
      <td><em>{p.familia_botanica || '—'}</em></td>
      <td className="td-name"><em>{p.nombre_cientifico}</em></td>
      <td>{p.nombre_comun || '—'}</td>
      <td>{badge(p.status)}</td>
    </>;
  }
  if (section === 'organismo') {
    const o = item as Organismo;
    return <>
      <td className="td-id">#{o.idOrganismo}</td>
      <td><em>{o.familia_hospedera || '—'}</em></td>
      <td className="td-name"><em>{o.nombre_organismo}</em></td>
      <td>{badge(o.status)}</td>
    </>;
  }
  if (section === 'coleccion') {
    const c = item as Coleccion;
    return <>
      <td className="td-id">#{c.idColeccion}</td>
      <td className="catalog-code"><strong>{c.acronimo}</strong></td>
      <td className="td-name">{c.nombre_institucion || '—'}</td>
      <td>{badge(c.status)}</td>
    </>;
  }
  if (section === 'cita') {
    const c = item as Cita;
    return <>
      <td className="td-id">#{c.idCita}</td>
      <td className="td-name">{c.titulo}</td>
      <td><span className="text-muted-small">{c.autores || '—'}</span></td>
      <td><span className="text-muted-small">{c.revista || '—'}</span></td>
      <td><span className="text-muted-small">{c.volumen || '—'}</span></td>
      <td><span className="text-muted-small">{c.paginas || '—'}</span></td>
      <td>{c.anio || '—'}</td>
      <td>{badge(c.status)}</td>
    </>;
  }
  return null;
}

function filterItems(
  _section: CatalogSection,
  items: CatalogEntity[],
  q: string,
) {
  if (!q.trim()) return items;
  const lq = q.toLowerCase();
  
  return items.filter(item => {
    const anyItem = item as any;
    const name = (anyItem.nombre || anyItem.nombre_cientifico || anyItem.nombre_organismo || anyItem.titulo || '').toLowerCase();
    const extra = (anyItem.codigo || anyItem.acronimo || anyItem.autores || anyItem.apellido_paterno || '').toLowerCase();
    return name.includes(lq) || extra.includes(lq);
  });
}

interface GeneralProps {
  section: CatalogSection;
  items: CatalogEntity[];
  onNavigate: (view: 'alta' | 'modificar' | 'baja', item?: CatalogEntity) => void;
  onBack: () => void;
  modulePerms: {
    key_add: boolean | number;
    key_edit: boolean | number;
    key_delete: boolean | number;
    key_export: boolean | number;
  };
}

const General: React.FC<GeneralProps> = ({ section, items, onNavigate, onBack, modulePerms }) => {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const canAdd = Boolean(modulePerms.key_add);
  const canEdit = Boolean(modulePerms.key_edit);
  const canDelete = Boolean(modulePerms.key_delete);

  const cfg = SECTION_CONFIG[section];
  const filtered = filterItems(section, items, query);
  
  // Paginación
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + rowsPerPage);

  // Reset page on search or section change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, section]);

  const colCount = cfg.columns.length;

  return (
    <div className="screen-container">
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack} title="Volver al Panel">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">{cfg.label}</h2>
          </div>
        </div>
        <div className="header-actions">
          {canAdd && (
            <button id="btn-alta" className="btn-primary with-icon" onClick={() => onNavigate('alta')}>
              <Plus size={18} />
              Agregar {cfg.label}
            </button>
          )}
          {canEdit && (
            <button id="btn-actualizar" className="btn-warning with-icon" onClick={() => onNavigate('modificar')}>
              <Pencil size={18} />
              Modificar {cfg.label}
            </button>
          )}
          {canDelete && (
            <button id="btn-eliminar" className="btn-danger-soft with-icon" onClick={() => onNavigate('baja')}>
              <Trash2 size={18} />
              Eliminar {cfg.label}
            </button>
          )}
        </div>
      </div>

      <div className="table-controls">
        <div id="search-bar" className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder={`Buscar en ${cfg.label.toLowerCase()}...`}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="pagination-select-wrapper">
            <span className="pagination-select-label">Mostrar:</span>
            <select 
              className="pagination-select"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button className="btn-outline">
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      <div className="table-card">
        <table className="custom-table">
          <thead>
            <tr>
              {cfg.columns.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="td-empty">
                  {query ? `No se encontraron resultados para "${query}".` : cfg.emptyMsg}
                </td>
              </tr>
            ) : paginatedItems.map((item) => {
              const idKey = `id${section.charAt(0).toUpperCase()}${section.slice(1)}`;
              const key = (item as any)[idKey] || (item as any).idTaxon || (item as any).idPlanta || (item as any).idOrganismo || Math.random();
              return (
                <tr key={key}>
                  {renderRow(section, item)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="pagination-container animate-slide-in">
          <div className="pagination-info">
            <span>
              Mostrando <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + rowsPerPage, totalItems)}</strong> de <strong>{totalItems}</strong> registros
            </span>
          </div>

          <div className="pagination-controls">
            <button 
              className="btn-page-nav" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              title="Anterior"
            >
              <ChevronLeft size={20} />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              if (totalPages <= 7) {
                return (
                  <button key={p} className={`btn-page ${currentPage === p ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>
                    {p}
                  </button>
                );
              }
              if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                return (
                  <button key={p} className={`btn-page ${currentPage === p ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>
                    {p}
                  </button>
                );
              }
              if (p === 2 && currentPage > 3) return <span key="dots-1" style={{ color: 'var(--text-muted)' }}>...</span>;
              if (p === totalPages - 1 && currentPage < totalPages - 2) return <span key="dots-2" style={{ color: 'var(--text-muted)' }}>...</span>;
              return null;
            }).filter((v, i, a) => {
               if (v && (v as any).key && (v as any).key.includes('dots')) {
                 if (i > 0 && a[i-1] && (a[i-1] as any).key && (a[i-1] as any).key.includes('dots')) return false;
               }
               return !!v;
            })}

            <button 
              className="btn-page-nav" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              title="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default General;
