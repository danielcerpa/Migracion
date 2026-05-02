import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Edit2, Trash2,
  X, ChevronLeft, ChevronRight, Info,
  Send, FilePen, FileX, Bug
} from 'lucide-react';
import type { Especimen, ViewType } from './types';
import FichaTecnica from './FichaTecnica';
import type { UserPermission } from '../../context/AuthContext';

interface GeneralProps {
  especimenes: Especimen[];
  onNavigate: (view: ViewType, especimen?: Especimen) => void;
  modulePerms: UserPermission;
}

const General: React.FC<GeneralProps> = ({ especimenes, onNavigate, modulePerms }) => {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12); // Cambiado a 12 para la cuadrícula
  const [selectedEspecimen, setSelectedEspecimen] = useState<Especimen | null>(null);

  const canAdd    = Boolean(modulePerms.key_add);
  const canEdit   = Boolean(modulePerms.key_edit);
  const canDelete = Boolean(modulePerms.key_delete);

  // Es Admin si tiene los tres permisos operativos activos
  const isAdmin = canAdd && canEdit && canDelete;

  const filtered = query.trim() === ''
    ? especimenes
    : especimenes.filter(e => {
        const q = query.toLowerCase();
        return (
          (e.especie_nombre ?? '').toLowerCase().includes(q) ||
          e.id_especimen.toString().includes(q) ||
          (e.localidad_nombre ?? '').toLowerCase().includes(q) ||
          (e.colector_nombre ?? '').toLowerCase().includes(q)
        );
      });

  // Paginación
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  return (
    <div className="screen-container">
      <div className="screen-header">
        <div>
          <h2 className="screen-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Registro de Especímenes
            <button 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text-color)' }}
              title="Ver guía del módulo"
              className="module-info-btn"
            >
              <Info size={18} />
            </button>
          </h2>
        </div>
        <div className="header-actions">
          {isAdmin ? (
            // ── Botones de acción directa (Administrador) ──────────────
            <>
              <button className="btn-primary with-icon" onClick={() => onNavigate('alta')}>
                <Plus size={18} />
                Registrar Espécimen
              </button>
              <button className="btn-warning with-icon" onClick={() => onNavigate('modificar')}>
                <Edit2 size={18} />
                Modificar Espécimen
              </button>
              <button className="btn-danger-soft with-icon" onClick={() => onNavigate('baja')}>
                <Trash2 size={18} />
                Eliminar Espécimen
              </button>
            </>
          ) : (
            // ── Botones de solicitud (usuarios sin perfil Admin) ────────
            <>
              <button
                className="btn-primary with-icon"
                onClick={() => onNavigate('enviar-solicitud')}
                title="Enviar una solicitud de registro de nuevo espécimen al administrador"
              >
                <Send size={17} />
                Enviar solicitud
              </button>
              <button
                className="btn-warning with-icon"
                onClick={() => onNavigate('editar-solicitud')}
                title="Editar o reenviar una solicitud existente"
              >
                <FilePen size={17} />
                Editar solicitud
              </button>
              <button
                className="btn-danger-soft with-icon"
                onClick={() => onNavigate('eliminar-solicitud')}
                title="Cancelar una solicitud pendiente o de baja"
              >
                <FileX size={17} />
                Eliminar solicitud
              </button>
            </>
          )}
        </div>
      </div>

      <div className="table-controls">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por especie, ID o colector..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="btn-clear" onClick={() => setQuery('')} title="Limpiar búsqueda">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="filter-group">
          <div className="pagination-select-wrapper">
            <span className="pagination-select-label">Mostrar:</span>
            <select 
              className="pagination-select"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
          <button className="btn-outline">
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </div>

      <div className="insect-cards-grid">
        {paginatedItems.length === 0 ? (
          <div className="empty-state">
            {query ? `No se encontraron especímenes para "${query}".` : 'No hay especímenes registrados.'}
          </div>
        ) : (
          paginatedItems.map((e) => (
            <div 
              key={e.id_especimen} 
              className="insect-card"
              onClick={() => setSelectedEspecimen(e)}
            >
              <div className="insect-card-header">

                <div className="insect-id">#{e.id_especimen.toString().padStart(5, '0')}</div>
              </div>
              <div className="insect-card-body">
                <h3 className="insect-common-name">{e.nombre_comun || 'Sin nombre común'}</h3>
                <p className="insect-scientific-name"><i>{e.nombre_cientifico || 'Sin nombre científico'}</i></p>
                <div className="insect-details">
                  <div className="insect-detail-item">
                    <span className="detail-label">Familia</span>
                    <span className="detail-value">{e.familia_nombre || '-'}</span>
                  </div>
                  <div className="insect-detail-item">
                    <span className="detail-label">Colector</span>
                    <span className="detail-value">{e.colector_nombre || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalItems > 0 && (
        <div className="pagination-container animate-slide-in">
          <div className="pagination-info">
            <span>
              Mostrando <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + rowsPerPage, totalItems)}</strong> de <strong>{totalItems}</strong> especímenes
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
              if (v && (v as any).key && (v as any).key.includes('dots')) {
                if (i > 0 && a[i-1] && (a[i-1] as any).key && (a[i-1] as any).key.includes('dots')) return false;
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

      {selectedEspecimen && (
        <FichaTecnica 
          specimen={selectedEspecimen} 
          onClose={() => setSelectedEspecimen(null)} 
        />
      )}
    </div>
  );
};

export default General;
