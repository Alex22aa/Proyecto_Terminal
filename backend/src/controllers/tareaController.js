// CONTROLLER: Tarea
// Logica de negocio para las tareas/actividades de un curso (RF-09).
//
// Politica de permisos:
// - Crear: solo el docente, a su propio nombre (dueno del curso).
// - Consultar: el docente dueno, el estudiante inscrito (activo) en el curso,
//   o el administrador (siempre).
// - Editar/Desactivar: el docente dueno del curso, o el administrador.

const { Tarea, Curso, Inscripcion } = require('../models');

// Verifica si quien pregunta tiene derecho a ver las tareas de este curso:
// el administrador siempre; el docente si es el dueno; el estudiante si tiene
// una inscripcion activa en el. Regresa el curso si tiene acceso, o null si no.
async function obtenerCursoConAcceso(cursoId, usuario) {
  const curso = await Curso.findOne({ where: { id: cursoId } });
  if (!curso) return null;

  if (usuario.rol === 'administrador') return curso;
  if (usuario.rol === 'docente') return curso.docenteId === usuario.id ? curso : null;
  if (usuario.rol === 'estudiante') {
    const inscripcion = await Inscripcion.findOne({
      where: { cursoId, estudianteId: usuario.id, activa: true },
    });
    return inscripcion ? curso : null;
  }
  return null;
}

async function crearTarea(req, res) {
  try {
    const { cursoId, titulo, descripcion, fechaEntrega, puntajeMaximo } = req.body;
    if (!cursoId || !titulo || !fechaEntrega) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const docenteId = req.usuario.id;
    const curso = await Curso.findOne({ where: { id: cursoId, docenteId } });
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado o no pertenece a este docente.' });
    }

    const datos = { cursoId, titulo, descripcion, fechaEntrega };
    if (puntajeMaximo !== undefined) datos.puntajeMaximo = puntajeMaximo;

    const tarea = await Tarea.create(datos);
    return res.status(201).json(tarea);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function listarTareasDelCurso(req, res) {
  try {
    const { cursoId } = req.params;

    const curso = await obtenerCursoConAcceso(cursoId, req.usuario);
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado o no tienes acceso a sus tareas.' });
    }

    const tareas = await Tarea.findAll({ where: { cursoId } });
    return res.json(tareas);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function editarTarea(req, res) {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fechaEntrega, puntajeMaximo } = req.body;

    const tarea = await Tarea.findOne({ where: { id }, include: [{ association: 'curso' }] });
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    const esDuenoDelCurso = tarea.curso.docenteId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDuenoDelCurso) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    const cambios = {};
    if (titulo !== undefined) cambios.titulo = titulo;
    if (descripcion !== undefined) cambios.descripcion = descripcion;
    if (fechaEntrega !== undefined) cambios.fechaEntrega = fechaEntrega;
    if (puntajeMaximo !== undefined) cambios.puntajeMaximo = puntajeMaximo;

    await tarea.update(cambios);
    return res.json(tarea);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function desactivarTarea(req, res) {
  try {
    const { id } = req.params;

    const tarea = await Tarea.findOne({ where: { id }, include: [{ association: 'curso' }] });
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    const esDuenoDelCurso = tarea.curso.docenteId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDuenoDelCurso) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    await tarea.update({ activa: false });
    return res.json(tarea);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { crearTarea, listarTareasDelCurso, editarTarea, desactivarTarea };
