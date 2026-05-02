import React, { useState } from 'react';
import {
  ArrowLeft, Clock, RotateCcw, FileX,
  MessageSquare, ChevronDown, ChevronUp, MapPin, Pencil,
} from 'lucide-react';
import type { Solicitud } from './types';

// ── Mock data — solo PENDIENTE y REGRESADA ────────────────────────────────────
const MOCK_SOLICITUDES: (Solicitud & { especie_nombre: string })[] = [
  {
    id_solicitud: 1,
    id_usuario: 3,
    id_especimen: null,
    estado: 'PENDIENTE',
    datos_propuestos: {
      especie: 'Apis mellifera',
      colector: 'Juan Pérez López',
      fecha_colecta: '2026-03-15',
      localidad: 'Tuxtla Gutiérrez, Chiapas',
      num_individuos: '2',
    },
    fecha_creacion: '2026-04-05T10:30:00Z',
    fecha_actualizacion: '2026-04-05T10:30:00Z',
    especie_nombre: 'Apis mellifera',
  },
  {
    id_solicitud: 2,
    id_usuario: 3,
    id_especimen: null,
    estado: 'REGRESADA',
    datos_propuestos: {
      especie: 'Bombus terrestris',
      colector: 'Ana García Ruiz',
      fecha_colecta: '2026-02-20',
      localidad: 'San Cristóbal de las Casas, Chiapas',
      num_individuos: '1',
    },
    fecha_creacion: '2026-04-03T14:15:00Z',
    fecha_actualizacion: '2026-04-04T09:00:00Z',
    especie_nombre: 'Bombus terrestris',
    comentario_revisor:
      'La fecha de colecta no coincide con los datos del campo. Verifica el año correcto antes de reenviar.',
  },
  {
    id_solicitud: 3,
    id_usuario: 3,
    id_especimen: null,
    estado: 'PENDIENTE',
    datos_propuestos: {
      especie: 'Formica rufa',
      colector: 'Daniela Castro',
      fecha_colecta: '2026-03-22',
      localidad: 'Comitán, Chiapas',
      num_individuos: '5',
    },
    fecha_creacion: '2026-04-06T08:00:00Z',
    fecha_actualizacion: '2026-04-06T08:00:00Z',
    especie_nombre: 'Formica rufa',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<'PENDIENTE' | 'REGRESADA', {
  label: string; icon: React.ReactNode; cls: string;
}> = {
  PENDIENTE: { label: 'En revisión',         icon: <Clock size={13} />,     cls: 'sol-badge--pending'  },
  REGRESADA: { label: 'Requiere corrección',  icon: <RotateCcw size={13} />, cls: 'sol-badge--returned' },
};

const FIELD_LABELS: Record<string, string> = {
  especie:        'Especie',
  colector:       'Colector',
  fecha_colecta:  'Fecha de colecta',
  localidad:      'Localidad',
  num_individuos: 'Núm. individuos',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface MisSolicitudesProps {
  mode: 'editar' | 'eliminar';
  onBack: () => void;
  onEditar?: (sol: Solicitud) => void;
  onEliminar?: (idSolicitud: number) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
const MisSolicitudes: React.FC<MisSolicitudesProps> = ({
  mode, onBack, onEditar, onEliminar,
}) => {
  const [expanded,      setExpanded]      = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // 'editar'   → PENDIENTE y REGRESADA (ambas son corregibles)
  // 'eliminar' → solo PENDIENTE (no tiene sentido cancelar una ya regresada con trabajo)
  const solicitudes = mode === 'eliminar'
    ? MOCK_SOLICITUDES.filter(s => s.estado === 'PENDIENTE')
    : MOCK_SOLICITUDES;

  const toggleExpand = (id: number) =>
    setExpanded(prev => prev === id ? null : id);

  return (
    <div className="screen-container animate-slide-in">

      {/* Header */}
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">Mis Solicitudes</h2>
            <p className="screen-subtitle">
              {mode === 'editar'
                ? 'Selecciona una solicitud para corregirla y reenviarla'
                : 'Selecciona una solicitud para cancelarla'}
            </p>
          </div>
        </div>
        <span className="sol-count" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
          {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Lista */}
      {solicitudes.length === 0 ? (
        <div className="sol-empty">
          <p>No tienes solicitudes activas en este momento.</p>
        </div>
      ) : (
        <div className="sol-list">
          {solicitudes.map(sol => {
            const cfg    = ESTADO_CONFIG[sol.estado as 'PENDIENTE' | 'REGRESADA'];
            const isOpen = expanded === sol.id_solicitud;

            return (
              <div
                key={sol.id_solicitud}
                className={`sol-card ${sol.estado === 'REGRESADA' ? 'sol-card--returned' : ''}`}
              >
                {/* ── Fila principal ── */}
                <div className="sol-card-main" onClick={() => toggleExpand(sol.id_solicitud)}>
                  <div className="sol-card-left">
                    <span className="sol-id">#{String(sol.id_solicitud).padStart(4, '0')}</span>
                    <span className="sol-especie">{sol.especie_nombre}</span>
                    <span className="sol-fecha-col">
                      Colecta: {sol.datos_propuestos.fecha_colecta ?? '—'}
                    </span>
                  </div>
                  <div className="sol-card-right">
                    <span className={`sol-badge ${cfg.cls}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    <span className="sol-date">{fmtDate(sol.fecha_actualizacion)}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* ── Detalle expandible ── */}
                {isOpen && (
                  <div className="sol-card-detail">
                    {/* Datos enviados */}
                    <div className="sol-datos" style={{ marginTop: '0.5rem' }}>
                      <p className="sol-datos-title">Datos enviados:</p>
                      <div className="sol-datos-grid">
                        {Object.entries(sol.datos_propuestos).map(([k, v]) => (
                          <div key={k} className="sol-dato-item">
                            <span className="sol-dato-key">
                              {FIELD_LABELS[k] ?? k.replace(/_/g, ' ')}
                            </span>
                            <span className="sol-dato-val">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Localidad */}
                    {sol.datos_propuestos.localidad && (
                      <div className="sol-loc">
                        <MapPin size={13} />
                        <span>{sol.datos_propuestos.localidad}</span>
                      </div>
                    )}

                    {/* Comentario del admin — visible si fue REGRESADA */}
                    {sol.estado === 'REGRESADA' && sol.comentario_revisor && (
                      <div className="sol-comment">
                        <MessageSquare size={14} />
                        <div>
                          <p className="sol-comment-title">Comentario del administrador:</p>
                          <p className="sol-comment-body">{sol.comentario_revisor}</p>
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="sol-actions">
                      {mode === 'editar' ? (
                        // Navega a la pantalla Modificar con los datos pre-cargados
                        <button
                          className="btn-warning with-icon"
                          onClick={() => onEditar?.(sol)}
                        >
                          <Pencil size={15} />
                          {sol.estado === 'REGRESADA' ? 'Corregir y reenviar' : 'Editar solicitud'}
                        </button>
                      ) : (
                        confirmDelete === sol.id_solicitud ? (
                          <div className="sol-confirm">
                            <span>¿Confirmas cancelar esta solicitud?</span>
                            <button
                              className="btn-danger-soft with-icon"
                              onClick={() => {
                                onEliminar?.(sol.id_solicitud);
                                setConfirmDelete(null);
                              }}
                            >
                              <FileX size={15} />
                              Sí, cancelar
                            </button>
                            <button className="btn-outline" onClick={() => setConfirmDelete(null)}>
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn-danger-soft with-icon"
                            onClick={() => setConfirmDelete(sol.id_solicitud)}
                          >
                            <FileX size={15} />
                            Cancelar solicitud
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisSolicitudes;
