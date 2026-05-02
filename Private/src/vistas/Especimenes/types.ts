export interface Especimen {
  id_especimen: number;
  id_pais?: number;
  id_estado?: number;
  id_municipio?: number;
  id_localidad?: number;
  id_orden?: number;
  id_familia?: number;
  id_subfamilia?: number;
  id_tribu?: number;
  id_genero?: number;
  id_especie?: number;
  id_tipo?: number;
  id_colector?: number;
  id_determinador?: number;
  id_planta?: number;
  id_organismo_huesped?: number;
  id_coleccion?: number;
  id_cita?: number;

  // Nombres (para el listado)
  nombre_comun?: string;
  nombre_cientifico?: string;
  pais_nombre?: string;
  estado_nombre?: string;
  municipio_nombre?: string;
  localidad_nombre?: string;
  orden_nombre?: string;
  familia_nombre?: string;
  subfamilia_nombre?: string;
  tribu_nombre?: string;
  genero_nombre?: string;
  especie_nombre?: string;
  colector_nombre?: string;
  determinador_nombre?: string;
  planta_nombre?: string;
  organismo_nombre?: string;
  coleccion_nombre?: string;
  cita_nombre?: string;

  anio_identificacion?: number;
  fecha_colecta?: string;
  altitud?: number;
  datos_ecologicos?: string;
  num_individuos?: number;
  envio_identificacion?: string;
  anio_catalogacion?: number;
  latitud_n?: number;
  longitud_o?: number;
  numero_frasco?: string;
  status: boolean;
}

export type ViewType =
  | 'general'
  | 'alta'
  | 'modificar'
  | 'baja'
  | 'detalle'
  | 'enviar-solicitud'     // no-admin: envío de nueva solicitud ALTA
  | 'editar-solicitud'     // no-admin: lista de mis solicitudes (editar/reenviar)
  | 'eliminar-solicitud'   // no-admin: lista de mis solicitudes (cancelar)
  | 'corregir-solicitud';  // no-admin: formulario inline para corregir una solicitud REGRESADA

export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'REGRESADA';

// Todas las solicitudes de usuarios no-admin son de tipo ALTA.
// Modificar o eliminar especímenes es responsabilidad exclusiva del admin.
export interface Solicitud {
  id_solicitud: number;
  id_usuario: number;
  id_especimen: number | null;   // null mientras PENDIENTE/REGRESADA; se llena al APROBAR
  estado: EstadoSolicitud;
  datos_propuestos: Record<string, any>; // campos completos del espécimen propuesto
  fecha_creacion: string;
  fecha_actualizacion: string;
  // datos enriquecidos del JOIN
  usuario_nombre?: string;
  especie_nombre?: string;           // nombre legíbile para mostrar en la lista
  comentario_revisor?: string;       // último comentario si fue REGRESADA
}

export interface CatalogItem {
  id: number;
  nombre: string;
}
