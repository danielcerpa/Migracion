import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Calendar, 
  Inbox,
  AlertCircle,
  Hash,
  MapPin,
  Leaf,
  Library
} from 'lucide-react';
import { 
  getPendientesAprobacion, 
  aprobarSolicitudAdmin, 
  rechazarSolicitudAdmin, 
  regresarSolicitudAdmin 
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Aprobaciones.css';

interface Solicitud {
  id_solicitud: number;
  id_usuario: number;
  usuario_nombre: string;
  usuario_apellido: string;
  estado: string;
  datos_propuestos: Record<string, any>;
  fecha_creacion: string;
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_SOLICITUDES: Solicitud[] = [
  {
    id_solicitud: 1,
    id_usuario: 2,
    usuario_nombre: 'Carlos',
    usuario_apellido: 'Mendoza Ruiz',
    estado: 'PENDIENTE',
    fecha_creacion: '2026-04-24T10:30:00Z',
    datos_propuestos: {
      nombre_cientifico: 'Dynastes hercules',
      nombre_comun: 'Escarabajo Hércules',
      id_orden: 1,
      id_familia: 2,
      id_municipio: 3,
      id_localidad: 5,
      id_coleccion: 1,
      fecha_colecta: '2026-03-15',
    },
  },
  {
    id_solicitud: 2,
    id_usuario: 3,
    usuario_nombre: 'Sofía',
    usuario_apellido: 'López García',
    estado: 'PENDIENTE',
    fecha_creacion: '2026-04-23T14:15:00Z',
    datos_propuestos: {
      nombre_cientifico: 'Morpho menelaus',
      nombre_comun: 'Mariposa Morpho Azul',
      id_orden: 4,
      id_familia: 7,
      id_municipio: 1,
      id_localidad: 2,
      id_coleccion: 2,
      fecha_colecta: '2026-04-01',
    },
  },
  {
    id_solicitud: 3,
    id_usuario: 5,
    usuario_nombre: 'Alejandro',
    usuario_apellido: 'Torres Vega',
    estado: 'PENDIENTE',
    fecha_creacion: '2026-04-22T09:00:00Z',
    datos_propuestos: {
      nombre_cientifico: 'Brachinus explodens',
      nombre_comun: 'Escarabajo Bombardero',
      id_orden: 1,
      id_familia: 3,
      id_municipio: 7,
      id_localidad: 9,
      id_coleccion: 1,
      fecha_colecta: '2026-02-20',
    },
  },
];

const MOCK_CATALOGS = {
  ordenes:    [{ id_orden: 1, nombre: 'Coleoptera' }, { id_orden: 4, nombre: 'Lepidoptera' }],
  familias:   [{ id_familia: 2, nombre: 'Dynastidae' }, { id_familia: 3, nombre: 'Carabidae' }, { id_familia: 7, nombre: 'Morphidae' }],
  municipios: [{ id_municipio: 1, nombre: 'Xalapa' }, { id_municipio: 3, nombre: 'Coatepec' }, { id_municipio: 7, nombre: 'Veracruz' }],
  localidades:[{ id_localidad: 2, nombre: 'El Lencero' }, { id_localidad: 5, nombre: 'Briones' }, { id_localidad: 9, nombre: 'La Antigua' }],
  colecciones:[{ id_coleccion: 1, nombre: 'Colección Principal', acronimo: 'CP-UV' }, { id_coleccion: 2, nombre: 'Colección Lepidoptera', acronimo: 'LEPI-UV' }],
  subfamilias: [], tribus: [], generos: [], especies: [],
};
// ─────────────────────────────────────────────────────────────────────────────

const Aprobaciones: React.FC = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(MOCK_SOLICITUDES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogs, setCatalogs] = useState<any>(MOCK_CATALOGS);
  
  // Modal state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentSolicitud, setCurrentSolicitud] = useState<number | null>(null);
  const [commentAction, setCommentAction] = useState<'RECHAZADA' | 'REGRESADA' | null>(null);
  const [commentText, setCommentText] = useState('');

  // Mock: no hacemos fetch real
  useEffect(() => {}, []);

  const fetchCatalogs = async () => {
    const endpoints = [
      ['ordenes',       '/api/catalogos/ordenes'],
      ['familias',      '/api/catalogos/familias'],
      ['subfamilias',   '/api/catalogos/subfamilias'],
      ['tribus',        '/api/catalogos/tribus'],
      ['generos',       '/api/catalogos/generos'],
      ['especies',      '/api/catalogos/especies'],
      ['municipios',    '/api/catalogos/municipios'],
      ['localidades',   '/api/catalogos/localidades'],
      ['colecciones',   '/api/catalogos/colecciones'],
    ];

    try {
      const results = await Promise.all(endpoints.map(([, url]) => fetch(url).then(r => r.ok ? r.json() : [])));
      const catObj: any = {};
      endpoints.forEach(([key], i) => { catObj[key] = results[i]; });
      setCatalogs(catObj);
    } catch (err) {
      console.error('Error fetching catalogs:', err);
    }
  };

  const getCatalogName = (catalogKey: string, id: any, nameField: string = 'nombre') => {
    if (!id || !catalogs[catalogKey]) return 'N/A';
    const item = catalogs[catalogKey].find((i: any) => 
      String(i[Object.keys(i)[0]]) === String(id) // Usually first field is the ID
    );
    return item ? item[nameField] : 'N/A';
  };

  const fetchSolicitudes = async () => {
    // MOCK: restaura los datos de ejemplo
    setSolicitudes(MOCK_SOLICITUDES);
    setError(null);
  };

  const handleApprove = async (id: number, _data: any) => {
    if (!window.confirm('¿Está seguro de que desea aprobar esta solicitud? Se creará un nuevo espécimen.')) return;
    // MOCK: solo elimina de la lista local
    setSolicitudes(prev => prev.filter(s => s.id_solicitud !== id));
    alert('(MOCK) Solicitud aprobada con éxito.');
  };

  const openCommentModal = (id: number, action: 'RECHAZADA' | 'REGRESADA') => {
    setCurrentSolicitud(id);
    setCommentAction(action);
    setCommentText('');
    setShowCommentModal(true);
  };

  const submitCommentAction = async () => {
    if (!currentSolicitud || !commentAction) return;
    if (commentAction === 'REGRESADA' && !commentText.trim()) {
      alert('Debe agregar un comentario para regresar la solicitud.');
      return;
    }
    // MOCK: solo elimina de la lista local
    setSolicitudes(prev => prev.filter(s => s.id_solicitud !== currentSolicitud));
    setShowCommentModal(false);
    alert(`(MOCK) Solicitud ${commentAction === 'RECHAZADA' ? 'rechazada' : 'regresada'} correctamente.`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="aprobaciones-container"><p>Cargando aprobaciones...</p></div>;

  return (
    <div className="aprobaciones-container">
      <header className="aprobaciones-header">
        <div>
          <h1 className="aprobaciones-title">Aprobaciones Pendientes</h1>
          <p className="aprobaciones-subtitle">
            Revisa y gestiona las solicitudes de registro enviadas por los capturistas.
          </p>
        </div>
      </header>

      {error ? (
        <div className="empty-state">
          <AlertCircle size={48} className="empty-icon" />
          <h3>{error}</h3>
          <button className="btn-aprobacion btn-return" onClick={fetchSolicitudes} style={{ marginTop: '1rem' }}>
            Reintentar
          </button>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="empty-state">
          <Inbox size={48} className="empty-icon" />
          <h3>No hay solicitudes pendientes</h3>
          <p>Todas las peticiones han sido procesadas.</p>
        </div>
      ) : (
        <div className="aprobaciones-grid">
          {solicitudes.map(sol => {
            const d = sol.datos_propuestos;
            return (
              <div key={sol.id_solicitud} className="aprobacion-card">
                <div className="card-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {sol.usuario_nombre.charAt(0)}
                    </div>
                    <div>
                      <div className="user-name">{sol.usuario_nombre} {sol.usuario_apellido}</div>
                      <div className="request-date">
                        <Calendar size={12} style={{ marginRight: 4 }} />
                        {formatDate(sol.fecha_creacion)}
                      </div>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="info-label">ID Solicitud</span>
                    <span className="info-value"><Hash size={12} /> {sol.id_solicitud}</span>
                  </div>
                </div>

                <div className="insect-info-grid">
                  <div className="info-item">
                    <span className="info-label"><Leaf size={12} /> Nombre Científico</span>
                    <span className="info-value scientific">{d.nombre_cientifico || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Nombre Común</span>
                    <span className="info-value">{d.nombre_comun || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Orden</span>
                    <span className="info-value">{getCatalogName('ordenes', d.id_orden)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Familia</span>
                    <span className="info-value">{getCatalogName('familias', d.id_familia)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Municipio</span>
                    <span className="info-value">{getCatalogName('municipios', d.id_municipio)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><MapPin size={12} /> Localidad</span>
                    <span className="info-value">{getCatalogName('localidades', d.id_localidad)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Fecha Colecta</span>
                    <span className="info-value">{d.fecha_colecta ? new Date(d.fecha_colecta).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><Library size={12} /> Colección</span>
                    <span className="info-value">{getCatalogName('colecciones', d.id_coleccion, 'acronimo')}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="btn-aprobacion btn-accept" 
                    onClick={() => handleApprove(sol.id_solicitud, sol.datos_propuestos)}
                    title="Aceptar y crear espécimen"
                  >
                    <CheckCircle size={18} />
                    Aceptar
                  </button>
                  <button 
                    className="btn-aprobacion btn-return" 
                    onClick={() => openCommentModal(sol.id_solicitud, 'REGRESADA')}
                    title="Regresar para corrección"
                  >
                    <RotateCcw size={18} />
                    Regresar
                  </button>
                  <button 
                    className="btn-aprobacion btn-reject" 
                    onClick={() => openCommentModal(sol.id_solicitud, 'RECHAZADA')}
                    title="Rechazar definitivamente"
                  >
                    <XCircle size={18} />
                    Rechazar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCommentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">
              {commentAction === 'RECHAZADA' ? 'Rechazar Solicitud' : 'Regresar Solicitud'}
            </h2>
            <p className="aprobaciones-subtitle" style={{ marginBottom: '1rem' }}>
              {commentAction === 'RECHAZADA' 
                ? 'Explique brevemente por qué se rechaza este registro.' 
                : 'Indique los cambios o correcciones que el usuario debe realizar.'}
            </p>
            <textarea 
              className="comment-textarea" 
              placeholder="Escriba sus comentarios aquí..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="modal-footer">
              <button className="btn-aprobacion btn-secondary" onClick={() => setShowCommentModal(false)}>
                Cancelar
              </button>
              <button 
                className={`btn-aprobacion ${commentAction === 'RECHAZADA' ? 'btn-reject' : 'btn-return'}`} 
                onClick={submitCommentAction}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aprobaciones;
