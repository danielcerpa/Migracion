export interface Foto {
  id_foto: number;
  id_colector: number | null;
  id_determinador: number | null;
  id_especimen: number;
  ruta_archivo: string;
  descripcion_foto: string | null;
  fecha_subida: string | null;
  status: boolean | number;
}

export type ViewTypeFototeca = 'general' | 'alta' | 'baja' | 'modificar';
