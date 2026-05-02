import React, { useState, useEffect } from 'react';
import { ShieldPlus, Search, Filter, ShieldCheck, ShieldAlert, CheckCircle, XCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { startModuleTour } from '../../components/useTour';
import type { Perfil } from './types';

interface GeneralProps {
  profiles: Perfil[];
  onNavigate: (view: 'alta' | 'baja' | 'modificar', profile?: Perfil) => void;
  modulePerms: {
    key_add: boolean | number;
    key_edit: boolean | number;
    key_delete: boolean | number;
    key_export: boolean | number;
  };
}

const General: React.FC<GeneralProps> = ({ profiles, onNavigate, modulePerms }) => {
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const canAdd = Boolean(modulePerms.key_add);
  const canEdit = Boolean(modulePerms.key_edit);
  const canDelete = Boolean(modulePerms.key_delete);

  const filtered = query.trim() === ''
    ? profiles
    : profiles.filter(p => {
        const q = query.toLowerCase();
        return (
          p.nickname.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
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
          <h2 id="module-header-title" className="screen-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Gestión de Perfiles
            <button 
              onClick={() => startModuleTour('Perfiles')}
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
              <ShieldPlus size={18} />
              Nuevo Perfil
            </button>
          )}
          {canEdit && (
            <button id="btn-actualizar" className="btn-warning with-icon" onClick={() => onNavigate('modificar')}>
              <ShieldCheck size={18} />
              Modificar Perfil
            </button>
          )}
          {canDelete && (
            <button id="btn-eliminar" className="btn-danger-soft with-icon" onClick={() => onNavigate('baja')}>
              <ShieldAlert size={18} />
              Eliminar Perfil
            </button>
          )}
        </div>
      </div>

      <div className="table-controls">
        <div id="search-bar" className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
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
              <th>ID</th>
              <th>Nombre del Perfil</th>
              <th>Descripción</th>
              <th style={{ textAlign: 'center' }}>Alta</th>
              <th style={{ textAlign: 'center' }}>Editar</th>
              <th style={{ textAlign: 'center' }}>Baja</th>
              <th style={{ textAlign: 'center' }}>Exportar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="td-empty">No se encontraron perfiles para &quot;{query}&quot;.</td>
              </tr>
            ) : paginatedItems.map(profile => (
              <tr key={profile.idProfile}>
                <td className="td-id">#{profile.idProfile}</td>
                <td className="td-name">
                  {profile.nickname}
                </td>
                <td><span className="text-muted-small">{profile.description}</span></td>
                <td style={{ textAlign: 'center' }}>
                  {profile.key_add ? <CheckCircle size={16} style={{ color: 'var(--success-color)' }} /> : <XCircle size={16} style={{ color: '#DC2626' }} />}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {profile.key_edit ? <CheckCircle size={16} style={{ color: 'var(--success-color)' }} /> : <XCircle size={16} style={{ color: '#DC2626' }} />}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {profile.key_delete ? <CheckCircle size={16} style={{ color: 'var(--success-color)' }} /> : <XCircle size={16} style={{ color: '#DC2626' }} />}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {profile.key_export ? <CheckCircle size={16} style={{ color: 'var(--success-color)' }} /> : <XCircle size={16} style={{ color: '#DC2626' }} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="pagination-container animate-slide-in">
          <div className="pagination-info">
            <span>
              Mostrando <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + rowsPerPage, totalItems)}</strong> de <strong>{totalItems}</strong> perfiles
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
    </div>
  );
};

export default General;
