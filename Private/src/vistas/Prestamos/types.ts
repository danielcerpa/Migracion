export interface Prestamo {
  idPrestamo: number;
  idEjemplar: number;
  nombre_cientifico: string;
  nombre_comun: string;
  prestatario: string;
  institucion: string;
  fecha_prestamo: string;
  fecha_devolucion_estimada: string;
  fecha_devolucion_real: string;
  estado_prestamo: string;
  proposito: string;
  condicion_al_prestar: string;
  observaciones: string;
  status: boolean;
}

export type ViewType = 'general' | 'alta' | 'baja' | 'modificar';
