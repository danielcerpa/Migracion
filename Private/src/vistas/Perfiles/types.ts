export interface Perfil {
  idProfile: number;
  nickname: string;
  description: string;
  key_add: boolean;
  key_delete: boolean;
  key_edit: boolean;
  key_export: boolean;
}

export type PartialPerfil = Omit<Perfil, 'idProfile'>;

export type ViewType = 'general' | 'alta' | 'baja' | 'modificar';
