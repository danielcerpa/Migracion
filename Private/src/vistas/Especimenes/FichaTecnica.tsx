import React, { useEffect } from 'react';
import { Bug, X } from 'lucide-react';
import type { Especimen } from './types';
import '../../styles/FichaTecnica.css';

interface FichaTecnicaProps {
  specimen: Especimen | null;
  onClose: () => void;
}

const FichaTecnica: React.FC<FichaTecnicaProps> = ({ specimen, onClose }) => {
  useEffect(() => {
    if (specimen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [specimen]);

  if (!specimen) return null;

  const val = (value: any) => value || '—';
  const year = specimen.fecha_colecta ? new Date(specimen.fecha_colecta).getFullYear().toString() : '—';
  const dateFormatted = specimen.fecha_colecta ? new Date(specimen.fecha_colecta).toLocaleDateString() : '—';

  return (
    <div className="ft-overlay" onClick={onClose}>
      <div className="ft-modal" onClick={e => e.stopPropagation()}>
        <button className="ft-close" onClick={onClose} title="Cerrar"><X size={24} /></button>

        <div className="ft-scroll">
          {/* Header */}
          <header className="ft-header">
            <h1 className="ft-title">FICHA TÉCNICA</h1>
            <p className="ft-subtitle">Colección Entomológica</p>
            <div className="ft-header-row">
              <div className="ft-field">
                <span className="ft-label">Colector</span>
                <span className="ft-value">{val(specimen.colector_nombre)}</span>
              </div>
              <div className="ft-field">
                <span className="ft-label">Año de Catalogación</span>
                <span className="ft-value">{val(specimen.anio_catalogacion)}</span>
              </div>
            </div>
          </header>

          {/* Nombre e Imagen */}
          <section className="ft-section ft-hero-section">
            <div className="ft-hero-info">
              <h2 className="ft-common-name">{val(specimen.nombre_comun)}</h2>
              <p className="ft-scientific-name"><i>{val(specimen.nombre_cientifico)}</i></p>
              <div className="ft-taxonomy-pills">
                {specimen.orden_nombre && <span className="ft-pill ft-pill-order">{specimen.orden_nombre}</span>}
                {specimen.familia_nombre && <span className="ft-pill ft-pill-family">{specimen.familia_nombre}</span>}
                {specimen.tribu_nombre && <span className="ft-pill ft-pill-tribu">{specimen.tribu_nombre}</span>}
              </div>
            </div>
            <div className="ft-hero-image">
              <Bug size={56} style={{ opacity: 0.5 }} />
            </div>
          </section>

          {/* Datos de Identificación */}
          <section className="ft-section">
            <h3 className="ft-section-title">Datos de Identificación</h3>
            <div className="ft-grid ft-grid-2">
              <div className="ft-field">
                <span className="ft-label">Nombre Común</span>
                <span className="ft-value">{val(specimen.nombre_comun)}</span>
              </div>
              <div className="ft-field">
                <span className="ft-label">Colección</span>
                <span className="ft-value">{val(specimen.coleccion_nombre)}</span>
              </div>
            </div>
          </section>

          {/* Datos de Colecta */}
          <section className="ft-section">
            <h3 className="ft-section-title">Datos de Colecta</h3>
            <div className="ft-grid ft-grid-3">
              <div className="ft-field">
                <span className="ft-label">Año</span>
                <span className="ft-value">{year}</span>
              </div>
              <div className="ft-field">
                <span className="ft-label">País</span>
                <span className="ft-value">{val(specimen.pais_nombre)}</span>
              </div>
              <div className="ft-field">
                <span className="ft-label">Estado</span>
                <span className="ft-value">{val(specimen.estado_nombre)}</span>
              </div>
            </div>
            <div className="ft-grid ft-grid-2">
              <div className="ft-field">
                <span className="ft-label">Localidad</span>
                <span className="ft-value">{val(specimen.localidad_nombre)}</span>
              </div>
              <div className="ft-field">
                <span className="ft-label">Fecha de Colecta</span>
                <span className="ft-value">{dateFormatted}</span>
              </div>
            </div>
            <div className="ft-grid ft-grid-2">
              <div className="ft-field">
                <span className="ft-label">Altitud</span>
                <span className="ft-value">{specimen.altitud ? `${specimen.altitud} m` : '—'}</span>
              </div>
            </div>
          </section>

          {/* Ubicación Geográfica */}
          <section className="ft-section">
            <h3 className="ft-section-title">Ubicación Geográfica</h3>
            <div className="ft-grid ft-grid-2">
              <div className="ft-field">
                <span className="ft-label">Latitud</span>
                <span className="ft-value">{specimen.latitud_n ? `${specimen.latitud_n}°` : '—'}</span>
              </div>
              <div className="ft-field">
                <span className="ft-label">Longitud</span>
                <span className="ft-value">{specimen.longitud_o ? `${specimen.longitud_o}°` : '—'}</span>
              </div>
            </div>
          </section>

          {/* Datos Biológicos */}
          <section className="ft-section">
            <h3 className="ft-section-title">Datos Biológicos</h3>
            <div className="ft-grid ft-grid-2">
              <div className="ft-field">
                <span className="ft-label">Tribu</span>
                <span className="ft-value">{val(specimen.tribu_nombre)}</span>
              </div>
              <div className="ft-field">
                <span className="ft-label">Planta Hospedera</span>
                <span className="ft-value ft-italic">{val(specimen.planta_nombre)}</span>
              </div>
              <div className="ft-field">
                <span className="ft-label">Organismo Huésped / Presa</span>
                <span className="ft-value ft-italic">{val(specimen.organismo_nombre)}</span>
              </div>
            </div>
          </section>

          {/* Catalogación y Registro */}
          <section className="ft-section">
            <h3 className="ft-section-title">Catalogación</h3>
            <div className="ft-grid ft-grid-2">
              <div className="ft-field">
                <span className="ft-label">Determinador</span>
                <span className="ft-value">{val(specimen.determinador_nombre)}</span>
              </div>
              <div className="ft-field">
                <span className="ft-label">Año de Catalogación</span>
                <span className="ft-value">{val(specimen.anio_catalogacion)}</span>
              </div>
            </div>
            <div className="ft-grid ft-grid-1">
              <div className="ft-field">
                <span className="ft-label">Cita Bibliográfica</span>
                <span className="ft-value">{val(specimen.cita_nombre)}</span>
              </div>
            </div>
          </section>

          {/* Datos Ecológicos / Taxonómicos */}
          <section className="ft-section">
            <h3 className="ft-section-title">Datos Ecológicos / Taxonómicos</h3>
            <div className="ft-notes">
              {specimen.datos_ecologicos || 'Sin datos ecológicos registrados.'}
            </div>
          </section>


        </div>
      </div>
    </div>
  );
};

export default FichaTecnica;
