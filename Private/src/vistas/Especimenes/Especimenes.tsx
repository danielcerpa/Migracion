import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import General from './General';
import Alta from './Alta';
import Modificar from './Modificar';
import Baja from './Baja';
import MisSolicitudes from './MisSolicitudes';

import {
  getEspecimenes, createEspecimen, updateEspecimen, deleteEspecimen,
  crearSolicitud, reenviarSolicitud, eliminarSolicitud, getMisSolicitudes
} from '../../services/api';
import type { Especimen, ViewType, Solicitud } from './types';

const MOCK_ESPECIMEN: Especimen = {
  id_especimen: 9999,
  nombre_comun: 'Mariposa Monarca',
  nombre_cientifico: 'Danaus plexippus',
  orden_nombre: 'Lepidoptera',
  familia_nombre: 'Nymphalidae',
  subfamilia_nombre: 'Danainae',
  tribu_nombre: 'Danaini',
  genero_nombre: 'Danaus',
  especie_nombre: 'Danaus plexippus (Monarca)',
  pais_nombre: 'México',
  estado_nombre: 'Michoacán',
  municipio_nombre: 'Ocampo',
  localidad_nombre: 'Santuario El Rosario',
  latitud_n: 19.567,
  longitud_o: -100.283,
  altitud: 3000,
  fecha_colecta: '2023-11-15T00:00:00Z',
  colector_nombre: 'Dr. López (UNAM)',
  determinador_nombre: 'Dra. Ramírez',
  anio_identificacion: 2023,
  planta_nombre: 'Asclepias curassavica',
  organismo_nombre: '-',
  coleccion_nombre: 'Mariposas de Norteamérica',
  cita_nombre: 'Reporte Anual 2023',
  datos_ecologicos: 'Encontrado en bosque de Oyamel, restinga, humedad relativa alta. Migración de invierno.',
  num_individuos: 1,
  numero_frasco: 'L-1025',
  envio_identificacion: 'No',
  anio_catalogacion: 2024,
  status: true,
};

import { useAuth, type UserPermission } from '../../context/AuthContext';
import '../../styles/Especimenes.css';

const Especimenes: React.FC = () => {
  const { permissions, user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('general');
  const [especimenes, setEspecimenes] = useState<Especimen[]>([]);

  const [solicitudParaEditar, setSolicitudParaEditar] = useState<Solicitud | null>(null);

  const modulePerms = permissions.find((p: UserPermission) => p.name.toLowerCase().includes('ejemplar') || p.idModule === 6) || {
    key_add: 0, key_edit: 0, key_delete: 0, key_export: 0,
    name: "Registro de Ejemplares", idModule: 6
  };

  useEffect(() => {
    fetchEspecimenes();
    if (user) fetchMisSolicitudes();
  }, [user]);

  const fetchEspecimenes = async () => {
    try {
      const data = await getEspecimenes();
      if (data && data.length > 0) {
        setEspecimenes(data);
      } else {
        setEspecimenes([MOCK_ESPECIMEN]); // Mock inyectado si no hay nada en la BD
      }
    } catch (error) {
      console.error('Error fetching especimenes:', error);
    }
  };

  const fetchMisSolicitudes = async () => {
    if (!user) return;
    try {
      await getMisSolicitudes(user.id);
    } catch (error) {
      console.error('Error fetching solicitudes:', error);
    }
  };

  const handleNavigate = (view: ViewType) => { setCurrentView(view); };
  const goBackItems   = () => { setCurrentView('general'); };

  const handleSave = async (data: any) => {
    try {
      await createEspecimen(data);
      fetchEspecimenes();
      goBackItems();
    } catch (error) {
      console.error('Error saving especimen:', error);
      alert('Error al guardar el espécimen');
    }
  };

  const handleUpdate = async (id: number, data: any) => {
    try {
      await updateEspecimen(id, data);
      fetchEspecimenes();
      goBackItems();
    } catch (error) {
      console.error('Error updating especimen:', error);
      alert('Error al actualizar el espécimen');
    }
  };

  const handleBaja = async (id: number) => {
    try {
      await deleteEspecimen(id);
      fetchEspecimenes();
      goBackItems();
    } catch (error) {
      console.error('Error deleting especimen:', error);
      alert('Error al eliminar el espécimen');
    }
  };

  // ── Handlers solicitudes (no-admin) ───────────────────────────
  const handleEnviarSolicitud = async (datos: Record<string, any>) => {
    if (!user) return;
    try {
      await crearSolicitud({ id_usuario: user.id, tipo_solicitud: 'ALTA', datos_propuestos: datos });
      await fetchMisSolicitudes();
      goBackItems();
    } catch (error: any) {
      console.error('Error al enviar solicitud:', error);
      alert(error.message || 'Error al enviar la solicitud');
    }
  };

  const handleEditarSolicitud = async (idSolicitud: number, datos: Record<string, any>) => {
    try {
      await reenviarSolicitud(idSolicitud, datos);
      await fetchMisSolicitudes();
      goBackItems();
    } catch (error: any) {
      console.error('Error al editar solicitud:', error);
      alert(error.message || 'Error al editar la solicitud');
    }
  };

  const handleEliminarSolicitud = async (idSolicitud: number) => {
    try {
      await eliminarSolicitud(idSolicitud);
      await fetchMisSolicitudes();
      goBackItems();
    } catch (error: any) {
      console.error('Error al eliminar solicitud:', error);
      alert(error.message || 'Error al eliminar la solicitud');
    }
  };

  const CRUMB_LABELS: Record<string, string> = {
    alta:                 'Registro Nuevo',
    modificar:            'Editar Registro',
    baja:                 'Baja de Espécimen',
    'enviar-solicitud':   'Enviar Solicitud',
    'editar-solicitud':   'Mis Solicitudes',
    'eliminar-solicitud': 'Cancelar Solicitud',
    'corregir-solicitud': 'Corregir Solicitud',
  };

  const renderContent = () => {
    switch (currentView) {
      case 'general':
        return <General especimenes={especimenes} onNavigate={handleNavigate} modulePerms={modulePerms} />;
      case 'alta':
        return <Alta onBack={goBackItems} onSave={handleSave} />;
      case 'modificar':
        return <Modificar especimenes={especimenes} onBack={goBackItems} onUpdate={handleUpdate} />;
      case 'baja':
        return <Baja especimenes={especimenes} onBack={goBackItems} onBaja={handleBaja} />;

      // ── Vistas de solicitud (no-admin) ────────────────────────
      case 'enviar-solicitud':
        // Reutiliza Alta pero en modo solicitud: en lugar de guardar directamente, envía solicitud
        return (
          <Alta
            onBack={goBackItems}
            onSave={handleEnviarSolicitud}
            modoSolicitud
          />
        );
      case 'editar-solicitud':
        return (
          <MisSolicitudes
            mode="editar"
            onBack={goBackItems}
            onEditar={(sol) => {
              setSolicitudParaEditar(sol);
              setCurrentView('corregir-solicitud' as ViewType);
            }}
          />
        );
      case 'corregir-solicitud':
        return (
          <Modificar
            especimenes={especimenes}
            onBack={() => setCurrentView('editar-solicitud' as ViewType)}
            onUpdate={handleUpdate}
            solicitudId={solicitudParaEditar?.id_solicitud}
            solicitudDatos={solicitudParaEditar?.datos_propuestos}
            comentarioAdmin={(solicitudParaEditar as any)?.comentario_revisor}
            onReenviarSolicitud={handleEditarSolicitud}
          />
        );
      case 'eliminar-solicitud':
        return (
          <MisSolicitudes
            mode="eliminar"
            onBack={goBackItems}
            onEliminar={handleEliminarSolicitud}
          />
        );

      default:
        return <General especimenes={especimenes} onNavigate={handleNavigate} modulePerms={modulePerms} />;
    }
  };

  return (
    <div className="especimenes-module">
      {currentView !== 'general' && (
        <div className="module-breadcrumb">
          <span onClick={goBackItems}>Especímenes</span>
          <ChevronRight size={14} />
          <span className="current-crumb">
            {CRUMB_LABELS[currentView] ?? currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </span>
        </div>
      )}
      
      <div className="module-screen">
        {renderContent()}
      </div>
    </div>
  );
};

export default Especimenes;
