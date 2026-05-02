import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, UserCheck, UserMinus, Info, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { startModuleTour } from '../../components/useTour';
import { useAuth } from '../../context/AuthContext';
import type { Usuario } from './types';

interface GeneralProps {
  users: Usuario[];
  onNavigate: (view: 'alta' | 'baja' | 'modificar', user?: Usuario) => void;
  modulePerms: {
    key_add: boolean | number;
    key_edit: boolean | number;
    key_delete: boolean | number;
    key_export: boolean | number;
  };
}

const General: React.FC<GeneralProps> = ({ users, onNavigate, modulePerms }) => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const canAdd = Boolean(modulePerms.key_add);
  const canEdit = Boolean(modulePerms.key_edit);
  const canDelete = Boolean(modulePerms.key_delete);

  const filtered = query.trim() === ''
    ? users
    : users.filter(u => {
        const q = query.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          (u.last_name ?? '').toLowerCase().includes(q) ||
          (u.second_last_name ?? '').toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
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
            Gestión de Usuarios
            <button 
              onClick={() => startModuleTour('Usuarios')}
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
              <UserPlus size={18} />
              Nuevo Usuario
            </button>
          )}
          {canEdit && (
            <button id="btn-actualizar" className="btn-warning with-icon" onClick={() => onNavigate('modificar')}>
              <UserCheck size={18} />
              Modificar Usuario
            </button>
          )}
          {canDelete && (
            <button id="btn-eliminar" className="btn-danger-soft with-icon" onClick={() => onNavigate('baja')}>
              <UserMinus size={18} />
              Eliminar Usuario
            </button>
          )}
        </div>
      </div>

      <div className="table-controls">
        <div id="search-bar" className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, apellidos o email..."
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
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th>Email</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="td-empty">No se encontraron usuarios para &quot;{query}&quot;.</td>
              </tr>
            ) : paginatedItems.map(user => (
              <tr key={user.idUser}>
                <td className="td-id">#{user.idUser}</td>
                <td className="td-name" style={currentUser?.id === user.idUser ? { color: 'var(--success-color)' } : {}}>
                  {user.name}
                </td>
                <td>{user.last_name || '-'}</td>
                <td>{user.second_last_name || '-'}</td>
                <td><code className="user-code">{user.email}</code></td>
                <td>
                  <span className={`status-badge ${user.status ? 'activo' : 'inactivo'}`}>
                    {user.status ? 'Activo' : 'Inactivo'}
                  </span>
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
              Mostrando <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + rowsPerPage, totalItems)}</strong> de <strong>{totalItems}</strong> usuarios
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
