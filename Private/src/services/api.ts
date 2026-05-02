const API_URL = '/api';

export const testConnection = async () => {
  const response = await fetch(`${API_URL}/test`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const loginUsuario = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión');
  return data;
};

export const getModulesAll = async () => {
  const response = await fetch(`${API_URL}/modules/all`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const getProfilesAll = async () => {
  const response = await fetch(`${API_URL}/profiles`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const createUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al crear usuario');
  return data;
};

export const updateUser = async (userId: number, userData: any) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al actualizar usuario');
  return data;
};

export const deleteUser = async (userId: number) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error al eliminar usuario');
  return data;
};

// ── Especimenes ───────────────────────────────────────────────
export const getEspecimenes = async () => {
  const response = await fetch(`${API_URL}/especimenes`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const createEspecimen = async (data: any) => {
  const response = await fetch(`${API_URL}/especimenes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Error al registrar espécimen');
  return result;
};

export const updateEspecimen = async (id: number, data: any) => {
  const response = await fetch(`${API_URL}/especimenes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Error al actualizar espécimen');
  return result;
};

export const deleteEspecimen = async (id: number) => {
  const response = await fetch(`${API_URL}/especimenes/${id}`, { method: 'DELETE' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Error al eliminar espécimen');
  return result;
};

// ── Solicitudes (usuarios no-admin) ───────────────────────────
/** Crea una solicitud de ALTA, EDICION o BAJA */
export const crearSolicitud = async (data: {
  id_usuario: number;
  id_especimen?: number | null;
  tipo_solicitud: 'ALTA' | 'EDICION' | 'BAJA';
  datos_propuestos?: Record<string, any>;
}) => {
  const response = await fetch(`${API_URL}/solicitudes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Error al enviar solicitud');
  return result;
};

/** Reenvía una solicitud REGRESADA con datos corregidos */
export const reenviarSolicitud = async (id: number, datos_propuestos: Record<string, any>) => {
  const response = await fetch(`${API_URL}/solicitudes/${id}/reenviar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ datos_propuestos }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Error al reenviar solicitud');
  return result;
};

/** Elimina (cancela) una solicitud PENDIENTE o REGRESADA */
export const eliminarSolicitud = async (id: number) => {
  const response = await fetch(`${API_URL}/solicitudes/${id}`, { method: 'DELETE' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Error al eliminar solicitud');
  return result;
};

/** Obtiene todas las solicitudes de un usuario */
export const getMisSolicitudes = async (idUsuario: number) => {
  const response = await fetch(`${API_URL}/solicitudes?id_usuario=${idUsuario}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

// ── Aprobaciones (Admin) ──────────────────────────────────────
export const getPendientesAprobacion = async () => {
  const response = await fetch(`${API_URL}/aprobaciones/pendientes`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const aprobarSolicitudAdmin = async (idSolicitud: number, idRevisor: number, data: any, comentarios?: string) => {
  const response = await fetch(`${API_URL}/aprobaciones/${idSolicitud}/aprobar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idRevisor, data, comentarios }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Error al aprobar solicitud');
  return result;
};

export const rechazarSolicitudAdmin = async (idSolicitud: number, idRevisor: number, comentarios?: string) => {
  const response = await fetch(`${API_URL}/aprobaciones/${idSolicitud}/rechazar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idRevisor, comentarios }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Error al rechazar solicitud');
  return result;
};

export const regresarSolicitudAdmin = async (idSolicitud: number, idRevisor: number, comentarios: string) => {
  const response = await fetch(`${API_URL}/aprobaciones/${idSolicitud}/regresar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idRevisor, comentarios }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Error al regresar solicitud');
  return result;
};
