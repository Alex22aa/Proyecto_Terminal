// CONTROLLER: Entrega
// Logica de negocio para las entregas de los estudiantes (RF-10).
//
// Politica de permisos (distinta a las demas entidades):
// - Crear/actualizar la entrega: el propio estudiante, a su nombre.
// - Calificar: el docente dueno del curso, o el administrador.
// - Consultar: el docente dueno, el administrador, o el estudiante (solo su
//   propia entrega).

const { Entrega, Tarea, Inscripcion } = require('../models');

// Busca la tarea con su curso, para saber si el estudiante esta inscrito.
async function obtenerTareaConCurso(tareaId) {
  return Tarea.findOne({ where: { id: tareaId }, include: [{ association: 'curso' }] });
}

async function crearEntrega(req, res) {
  try {
    const { tareaId, archivoUrl } = req.body;
    if (!tareaId) {
      return res.status(400).json({ error: 'Falta el id de la tarea.' });
    }

    const tarea = await obtenerTareaConCurso(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    const estudianteId = req.usuario.id;
    const inscripcion = await Inscripcion.findOne({
      where: { cursoId: tarea.curso.id, estudianteId, activa: true },
    });
    if (!inscripcion) {
      return res.status(404).json({ error: 'No estas inscrito en el curso de esta tarea.' });
    }

    const yaExiste = await Entrega.findOne({ where: { tareaId, estudianteId } });
    if (yaExiste) {
      return res.status(400).json({ error: 'Ya entregaste esta tarea. Usa actualizar en vez de crear.' });
    }

    const entrega = await Entrega.create({
      tareaId,
      estudianteId,
      archivoUrl,
      estado: 'entregada',
    });
    return res.status(201).json(entrega);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function actualizarEntrega(req, res) {
  try {
    const { id } = req.params;
    const { archivoUrl } = req.body;

    const entrega = await Entrega.findOne({ where: { id } });
    if (!entrega || entrega.estudianteId !== req.usuario.id) {
      return res.status(404).json({ error: 'Entrega no encontrada.' });
    }
    if (entrega.estado === 'calificada') {
      return res.status(400).json({ error: 'Esta entrega ya fue calificada y no se puede modificar.' });
    }

    await entrega.update({ archivoUrl, estado: 'entregada' });
    return res.json(entrega);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function calificarEntrega(req, res) {
  try {
    const { id } = req.params;
    const { puntajeObtenido, comentario } = req.body;
    if (puntajeObtenido === undefined) {
      return res.status(400).json({ error: 'Falta el puntaje obtenido.' });
    }

    const entrega = await Entrega.findOne({
      where: { id },
      include: [{ association: 'tarea', include: [{ association: 'curso' }] }],
    });
    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no encontrada.' });
    }

    const esDuenoDelCurso = entrega.tarea.curso.docenteId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDuenoDelCurso) {
      return res.status(404).json({ error: 'Entrega no encontrada.' });
    }

    await entrega.update({
      puntajeObtenido,
      comentario,
      docenteId: req.usuario.id,
      fechaCalificacion: new Date(),
      estado: 'calificada',
    });
    return res.json(entrega);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function listarEntregasDeTarea(req, res) {
  try {
    const { tareaId } = req.params;

    const tarea = await obtenerTareaConCurso(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    const esDuenoDelCurso = tarea.curso.docenteId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDuenoDelCurso) {
      return res.status(404).json({ error: 'Tarea no encontrada o no tienes acceso a sus entregas.' });
    }

    const entregas = await Entrega.findAll({
      where: { tareaId },
      include: [{ association: 'estudiante', attributes: ['id', 'nombreCompleto', 'correoInstitucional'] }],
    });
    return res.json(entregas);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function obtenerMiEntrega(req, res) {
  try {
    const { tareaId } = req.params;

    const entrega = await Entrega.findOne({
      where: { tareaId, estudianteId: req.usuario.id },
    });
    if (!entrega) {
      return res.status(404).json({ error: 'Todavia no has entregado esta tarea.' });
    }
    return res.json(entrega);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  crearEntrega,
  actualizarEntrega,
  calificarEntrega,
  listarEntregasDeTarea,
  obtenerMiEntrega,
};
