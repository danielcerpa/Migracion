// ============================================================
// types.ts — Tipos del módulo Catálogos
// ============================================================
// ARCHIVO VITAL: Aquí recaen todos los contratos de información (Interfaces).
// Si tu Base de Datos en MySQL cambia (se añade una columna a tabla 'pais' por ej), 
// debe obligatoriamente reflejarse aquí para que React y TypeScript no arrojen errores.
// ============================================================

// Tipo de unión (literal) que restringe y dicta todas las subclases o pestañas de catálogo que el sistema soporta.
export type CatalogSection =
  | 'pais'
  | 'estado'
  | 'municipio'
  | 'localidad'
  | 'orden'
  | 'familia'
  | 'subfamilia'
  | 'tribu'
  | 'genero'
  | 'especie'
  | 'tipo'
  | 'colector'
  | 'determinador'
  | 'planta'
  | 'organismo'
  | 'coleccion'
  | 'cita';

// Tipo de unión estricto: Manejador de estado de las vistas. Limita al Enrutador a sólo poder invocar a estas cuatro pantallas gráficas.
export type ViewType = 'dashboard' | 'general' | 'alta' | 'modificar' | 'baja';

// ============================================================
// INTERFACES SQL -> TYPESCRIPT
// ============================================================

export interface Pais {
  idPais: number;
  nombre: string;
  codigo?: string;
  status: boolean;
}

export interface Estado {
  idEstado: number;
  idPais: number;
  nombre: string;
  nombrePais?: string; // Virtual para visualización
  status: boolean;
}

export interface Municipio {
  idMunicipio: number;
  idEstado: number;
  nombre: string;
  nombreEstado?: string;
  status: boolean;
}

export interface Localidad {
  idLocalidad: number;
  idMunicipio: number;
  nombre: string;
  nombreMunicipio?: string;
  latitud?: string;
  longitud?: string;
  altitud?: string;
  status: boolean;
}

// Taxonomía
export interface Orden {
  idOrden: number;
  nombre: string;
  status: boolean;
}

export interface Familia {
  idFamilia: number;
  idOrden?: number;
  nombre: string;
  nombreOrden?: string;
  status: boolean;
}

export interface Subfamilia {
  idSubfamilia: number;
  idFamilia?: number;
  nombre: string;
  nombreFamilia?: string;
  status: boolean;
}

export interface Tribu {
  idTribu: number;
  idSubfamilia?: number;
  nombre: string;
  nombreSubfamilia?: string;
  status: boolean;
}

export interface Genero {
  idGenero: number;
  idTribu?: number;
  nombre: string;
  nombreTribu?: string;
  status: boolean;
}

export interface Especie {
  idEspecie: number;
  idGenero?: number;
  nombre: string;
  subespecie?: string;
  nombreGenero?: string;
  status: boolean;
}

export interface Tipo {
  idTipo: number;
  nombre: string;
  status: boolean;
}

// Personas
export interface Colector {
  idColector: number;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  correo?: string;
  institucion?: string;
  status: boolean;
}

export interface Determinador {
  idDeterminador: number;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  correo?: string;
  institucion?: string;
  status: boolean;
}

// Bio / Biblio
export interface Planta {
  idPlanta: number;
  familia_botanica?: string;
  nombre_cientifico: string;
  nombre_comun?: string;
  status: boolean;
}

export interface Organismo {
  idOrganismo: number;
  familia_hospedera?: string;
  nombre_organismo: string;
  status: boolean;
}

export interface Coleccion {
  idColeccion: number;
  acronimo: string;
  nombre_institucion?: string;
  status: boolean;
}

export interface Cita {
  idCita: number;
  titulo: string;
  autores?: string;
  anio?: number;
  revista?: string;
  volumen?: string;
  paginas?: string;
  referencia_completa?: string;
  status: boolean;
}


// Embotellado Global
export type CatalogEntity = 
  | Pais | Estado | Municipio | Localidad 
  | Orden | Familia | Subfamilia | Tribu | Genero | Especie | Tipo
  | Colector | Determinador 
  | Planta | Organismo | Coleccion | Cita;

