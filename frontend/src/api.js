// Cliente simple para hablar con la API REST del backend (MVC del lado servidor).
// El frontend en React consume esto; nunca habla directo con la base de datos.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function iniciarSesion(correoInstitucional, contrasena) {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correoInstitucional, contrasena }),
  });
  if (!respuesta.ok) {
    throw new Error('No se pudo iniciar sesion');
  }
  return respuesta.json();
}

export async function registrarUsuario(datos) {
  const respuesta = await fetch(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo registrar el usuario');
  }
  return respuesta.json();
}

export async function obtenerCursos(token) {
  const respuesta = await fetch(`${API_URL}/cursos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los cursos');
  }
  return respuesta.json();
}

export async function crearCurso(token, datos) {
  const respuesta = await fetch(`${API_URL}/cursos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo crear el curso');
  }
  return respuesta.json();
}

export async function editarCurso(token, id, datos) {
  const respuesta = await fetch(`${API_URL}/cursos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo editar el curso');
  }
  return respuesta.json();
}

export async function archivarCurso(token, id) {
  const respuesta = await fetch(`${API_URL}/cursos/${id}/archivar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudo archivar el curso');
  }
  return respuesta.json();
}

export async function obtenerTareasDelCurso(token, cursoId) {
  const respuesta = await fetch(`${API_URL}/tareas/curso/${cursoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener las tareas');
  }
  return respuesta.json();
}

export async function crearTarea(token, datos) {
  const respuesta = await fetch(`${API_URL}/tareas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo crear la tarea');
  }
  return respuesta.json();
}

export async function editarTarea(token, id, datos) {
  const respuesta = await fetch(`${API_URL}/tareas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo editar la tarea');
  }
  return respuesta.json();
}

export async function desactivarTarea(token, id) {
  const respuesta = await fetch(`${API_URL}/tareas/${id}/desactivar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudo desactivar la tarea');
  }
  return respuesta.json();
}

export async function obtenerEntregasDeTarea(token, tareaId) {
  const respuesta = await fetch(`${API_URL}/entregas/tarea/${tareaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener las entregas');
  }
  return respuesta.json();
}

export async function obtenerRubricaDeTarea(token, tareaId) {
  const respuesta = await fetch(`${API_URL}/rubricas/tarea/${tareaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (respuesta.status === 404) return null;
  if (!respuesta.ok) {
    throw new Error('No se pudo obtener la rubrica');
  }
  return respuesta.json();
}

export async function crearRubrica(token, datos) {
  const respuesta = await fetch(`${API_URL}/rubricas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo crear la rubrica');
  }
  return respuesta.json();
}

export async function editarRubrica(token, id, datos) {
  const respuesta = await fetch(`${API_URL}/rubricas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo editar la rubrica');
  }
  return respuesta.json();
}

export async function eliminarRubrica(token, id) {
  const respuesta = await fetch(`${API_URL}/rubricas/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudo borrar la rubrica');
  }
}

export async function obtenerCriteriosDeRubrica(token, rubricaId) {
  const respuesta = await fetch(`${API_URL}/criterios-rubrica/rubrica/${rubricaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los criterios');
  }
  return respuesta.json();
}

export async function crearCriterio(token, datos) {
  const respuesta = await fetch(`${API_URL}/criterios-rubrica`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo crear el criterio');
  }
  return respuesta.json();
}

export async function editarCriterio(token, id, datos) {
  const respuesta = await fetch(`${API_URL}/criterios-rubrica/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo editar el criterio');
  }
  return respuesta.json();
}

export async function eliminarCriterio(token, id) {
  const respuesta = await fetch(`${API_URL}/criterios-rubrica/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudo eliminar el criterio');
  }
}

export async function obtenerMisNotificaciones(token) {
  const respuesta = await fetch(`${API_URL}/notificaciones/mis-notificaciones`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener las notificaciones');
  }
  return respuesta.json();
}

export async function marcarNotificacionLeida(token, id) {
  const respuesta = await fetch(`${API_URL}/notificaciones/${id}/marcar-leida`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudo marcar la notificacion como leida');
  }
  return respuesta.json();
}

export async function eliminarNotificacion(token, id) {
  const respuesta = await fetch(`${API_URL}/notificaciones/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudo eliminar la notificacion');
  }
}

export async function obtenerMisCursos(token) {
  const respuesta = await fetch(`${API_URL}/inscripciones/mis-cursos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener tus cursos');
  }
  return respuesta.json();
}

export async function obtenerMiEntrega(token, tareaId) {
  const respuesta = await fetch(`${API_URL}/entregas/mi-entrega/${tareaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (respuesta.status === 404) return null;
  if (!respuesta.ok) {
    throw new Error('No se pudo obtener tu entrega');
  }
  return respuesta.json();
}

export async function crearEntrega(token, datos) {
  const respuesta = await fetch(`${API_URL}/entregas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo entregar la tarea');
  }
  return respuesta.json();
}

export async function actualizarEntrega(token, id, datos) {
  const respuesta = await fetch(`${API_URL}/entregas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo actualizar tu entrega');
  }
  return respuesta.json();
}

export async function calificarEntrega(token, id, datos) {
  const respuesta = await fetch(`${API_URL}/entregas/${id}/calificar`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo calificar la entrega');
  }
  return respuesta.json();
}
