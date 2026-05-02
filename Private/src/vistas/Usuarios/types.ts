export interface ModuloPermiso {
  idModule: number;
  idProfile: number;
}

export interface Usuario {
  idUser: number;
  name: string;
  last_name: string;
  second_last_name: string;
  email: string;
  status: boolean;
  permisos?: ModuloPermiso[];
}

export type ViewType = 'general' | 'alta' | 'baja' | 'modificar';
