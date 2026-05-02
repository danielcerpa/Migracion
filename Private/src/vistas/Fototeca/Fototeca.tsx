import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import General from './General';
import Alta from './Alta';
import Modificar from './Modificar';
import Baja from './Baja';
import type { Foto, ViewTypeFototeca } from './types';
import { useAuth, type UserPermission } from '../../context/AuthContext';
import '../../styles/Fototeca.css';

function getFotosMock(): Foto[] {
  return [
    {
      id_foto: 1,
      id_colector: null,
      id_determinador: null,
      id_especimen: 101,
      ruta_archivo: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop',
      descripcion_foto: 'Imagen prueba 1',
      fecha_subida: '2025-03-15T10:00:00.000Z',
      status: 1,
    },
    {
      id_foto: 2,
      id_colector: 1,
      id_determinador: null,
      id_especimen: 101,
      ruta_archivo: 'https://images.unsplash.com/photo-1470093851219-69951fcbb533?w=200&h=200&fit=crop',
      descripcion_foto: null,
      fecha_subida: '2025-03-16T09:30:00.000Z',
      status: 1,
    },
    {
      id_foto: 3,
      id_colector: null,
      id_determinador: 2,
      id_especimen: 202,
      ruta_archivo: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=200&h=200&fit=crop',
      descripcion_foto: 'Imagen prueba 3',
      fecha_subida: '2025-03-17T14:20:00.000Z',
      status: 1,
    },
  ];
}

const Fototeca: React.FC = () => {
  const { permissions } = useAuth();
  const [currentView, setCurrentView] = useState<ViewTypeFototeca>('general');
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null);
  const [isUsingMock, setIsUsingMock] = useState(false);
  /** Motivo por el que se muestran datos de demostración (error API o sin conexión). */
  const [apiError, setApiError] = useState<string | null>(null);

  const modulePerms = permissions.find((p: UserPermission) => p.name.toLowerCase().includes('fotot')) || {
    key_add: 0,
    key_edit: 0,
    key_delete: 0,
    key_export: 0
  };

  useEffect(() => {
    fetchFotos();
  }, []);

  const fetchFotos = async () => {
    setApiError(null);
    try {
      const response = await fetch('/api/fototeca');
      if (response.ok) {
        const data = await response.json();
        setFotos(Array.isArray(data) ? data : []);
        setIsUsingMock(false);
        return;
      }
      let detail = `HTTP ${response.status}`;
      try {
        const errBody = await response.json() as { details?: string; error?: string };
        if (errBody.details) detail = errBody.details;
        else if (errBody.error) detail = errBody.error;
      } catch {
        /* cuerpo no JSON */
      }
      setApiError(detail);
      setFotos(getFotosMock());
      setIsUsingMock(true);
    } catch {
      setApiError('No se pudo conectar con el API (¿está el servidor Node en el puerto 3000 y `npm run dev` activo?)');
      setFotos(getFotosMock());
      setIsUsingMock(true);
    }
  };

  const handleSaved = async () => {
    await fetchFotos();
    goBackToGeneral();
  };

  const handleNavigate = (view: ViewTypeFototeca, foto?: Foto) => {
    if (foto) setSelectedFoto(foto);
    else if (view === 'alta') setSelectedFoto(null);
    setCurrentView(view);
  };

  const goBackToGeneral = () => {
    setCurrentView('general');
    setSelectedFoto(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'general':
        return (
          <General
            fotos={fotos}
            onNavigate={handleNavigate}
            isUsingMock={isUsingMock}
            apiError={apiError}
            modulePerms={modulePerms}
          />
        );
      case 'alta':
        return (
          <Alta
            onBack={goBackToGeneral}
            onSaved={handleSaved}
          />
        );
      case 'modificar':
        return (
          <Modificar
            fotos={fotos}
            foto={selectedFoto}
            onBack={goBackToGeneral}
            onSaved={handleSaved}
            onSelectFoto={(f) => setSelectedFoto(f)}
          />
        );
      case 'baja':
        return (
          <Baja
            fotos={fotos}
            foto={selectedFoto}
            onSelectFoto={(f) => setSelectedFoto(f)}
            onBack={goBackToGeneral}
            onSaved={handleSaved}
          />
        );
      default:
        return (
          <General
            fotos={fotos}
            onNavigate={handleNavigate}
            isUsingMock={isUsingMock}
            apiError={apiError}
            modulePerms={modulePerms}
          />
        );
    }
  };

  return (
    <div className="fototeca-module">
      {currentView !== 'general' && (
        <div className="module-breadcrumb">
          <span
            onClick={goBackToGeneral}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && goBackToGeneral()}
          >
            Fototeca
          </span>
          <ChevronRight size={14} />
          <span className="current-crumb">
            {currentView === 'modificar'
              ? 'Actualizar'
              : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </span>
        </div>
      )}
      <div className="module-screen">
        {renderContent()}
      </div>
    </div>
  );
};

export default Fototeca;
