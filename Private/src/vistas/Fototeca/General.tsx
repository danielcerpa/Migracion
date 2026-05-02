import React, { useState, useEffect } from 'react';
import { ImagePlus, Search, Filter, ImageIcon, Trash2, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { startModuleTour } from '../../components/useTour';
import type { Foto } from './types';

export interface GeneralProps {
  fotos: Foto[];
  onNavigate: (view: 'alta' | 'baja' | 'modificar', foto?: Foto) => void;
  isUsingMock?: boolean;
  /** Detalle del error del API cuando se muestran datos Mock */
  apiError?: string | null;
  modulePerms: {
    key_add: boolean | number;
    key_edit: boolean | number;
    key_delete: boolean | number;
    key_export: boolean | number;
  };
}

function formatStatus(s: boolean | number): string {
  if (s === true || s === 1) return 'Activo';
  return 'Inactivo';
}

const General: React.FC<GeneralProps> = ({ fotos, onNavigate, isUsingMock, apiError, modulePerms }) => {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const canAdd = Boolean(modulePerms.key_add);
  const canEdit = Boolean(modulePerms.key_edit);
  const canDelete = Boolean(modulePerms.key_delete);

  const filtered = query.trim() === ''
    ? fotos
    : fotos.filter(f => {
        const q = query.toLowerCase();
        return (
          String(f.id_foto).includes(q) ||
          String(f.id_especimen).includes(q) ||
          (f.descripcion_foto ?? '').toLowerCase().includes(q) ||
          (f.ruta_archivo ?? '').toLowerCase().includes(q) ||
          (f.id_colector != null && String(f.id_colector).includes(q)) ||
          (f.id_determinador != null && String(f.id_determinador).includes(q))
        );
      });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const colSpan = 8;

  return (
    <div className="screen-container">
      <div className="screen-header">
        <div>
          <h2 id="module-header-title" className="screen-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Gestión de Fototeca {isUsingMock && <span className="status-badge inactivo" style={{fontSize: '0.7rem'}}>Mock</span>}
            <button
              onClick={() => startModuleTour('Fototeca')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-color)' }}
              title="Ver guía del módulo"
              className="module-info-btn"
            >
              <Info size={18} />
            </button>
          </h2>
        </div>
        <div className="header-actions">
          {canAdd && (
            <button id="btn-alta" className="btn-primary with-icon" onClick={() => onNavigate('alta')}>
              <ImagePlus size={18} />
              Nueva Imagen
            </button>
          )}
          {canEdit && (
            <button id="btn-actualizar" className="btn-warning with-icon" onClick={() => onNavigate('modificar')}>
              <ImageIcon size={18} />
              Modificar Imagen
            </button>
          )}
          {canDelete && (
            <button id="btn-eliminar" className="btn-danger-soft with-icon" onClick={() => onNavigate('baja')}>
              <Trash2 size={18} />
              Eliminar Imagen
            </button>
          )}
        </div>
      </div>

      {isUsingMock && apiError && (
        <div className="fototeca-mock-banner" role="alert">
          <strong>Datos de demostración.</strong> El servidor no devolvió la lista real: {apiError}
          {apiError.includes("doesn't exist") || apiError.includes('no existe') ? (
            <span>
              {' '}
              Suele faltar importar el esquema completo (<code>v2.sql</code>) o al menos crear la tabla{' '}
              <code>fototeca</code> y tablas relacionadas. Ver <code>Private/server/sql/create_fototeca_table.sql</code>.
            </span>
          ) : null}
        </div>
      )}

      <div className="table-controls">
        <div id="search-bar" className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por ID, espécimen, descripción, ruta, colector o determinador..."
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
          <button className="btn-outline" type="button">
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      <div className="table-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Id espécimen</th>
              <th>Imagen / Ruta</th>
              <th>Descripción</th>
              <th>Id colector</th>
              <th>Id determinador</th>
              <th>Fecha subida</th>
              <th className="td-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {fotos.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="td-empty">
                  No hay imágenes registradas. Usa &quot;Nueva Imagen&quot; para agregar.
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="td-empty">
                  No se encontraron imágenes para &quot;{query}&quot;.
                </td>
              </tr>
            ) : (
              paginatedItems.map((foto) => (
                <tr key={foto.id_foto}>
                  <td className="td-id">#{foto.id_foto}</td>
                  <td>{foto.id_especimen}</td>
                  <td>
                    {foto.ruta_archivo.startsWith('http://') || foto.ruta_archivo.startsWith('https://') ? (
                      <img
                        src={foto.ruta_archivo}
                        alt={foto.descripcion_foto || 'Imagen'}
                        className="fototeca-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <code className="user-code text-truncate" title={foto.ruta_archivo}>
                        {foto.ruta_archivo}
                      </code>
                    )}
                  </td>
                  <td>{foto.descripcion_foto || '-'}</td>
                  <td>{foto.id_colector ?? '-'}</td>
                  <td>{foto.id_determinador ?? '-'}</td>
                  <td>{foto.fecha_subida ? String(foto.fecha_subida) : '-'}</td>
                  <td className="td-center">
                    <span className={formatStatus(foto.status) === 'Activo' ? 'status-badge activo' : 'status-badge inactivo'}>
                      {formatStatus(foto.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="pagination-container animate-slide-in">
          <div className="pagination-info">
            <span>
              Mostrando <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + rowsPerPage, totalItems)}</strong> de <strong>{totalItems}</strong> imágenes
            </span>
          </div>

          <div className="pagination-controls">
            <button
              className="btn-page-nav"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              if (totalPages <= 7 || (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))) {
                return (
                  <button
                    key={p}
                    className={`btn-page ${currentPage === p ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                );
              }
              if (p === 2 || p === totalPages - 1) return <span key={`dots-${p}`} style={{ color: 'var(--text-muted)' }}>...</span>;
              return null;
            }).filter((v, i, a) => {
              if (v && (v as React.ReactElement).key && String((v as React.ReactElement).key).includes('dots')) {
                if (i > 0 && a[i - 1] && (a[i - 1] as React.ReactElement).key && String((a[i - 1] as React.ReactElement).key).includes('dots')) return false;
              }
              return !!v;
            })}

            <button
              className="btn-page-nav"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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
