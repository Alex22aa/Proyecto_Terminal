// CONTROLLER: Rubrica
// Permisos: crear y editar/eliminar solo el docente dueno o el admin.
// Consultar: docente dueno, estudiante inscrito, o admin.

const { Rubrica, Tarea, Inscripcion } = require('../models');

// Busca la tarea con su curso, y revisa si quien pregunta puede verla.
async function obtenerTareaConAcceso(tareaId, usuario) {
  const tarea = await Tarea.findOne({ where: { id: tareaId }, include: [{ association: 'curso' }] });
  if (!tarea) return null;

  if (usuario.rol === 'administrador') return tarea;
  if (usuario.rol === 'docente') return tarea.curso.docenteId === usuario.id ? tarea : null;
  if (usuario.rol === 'estudiante') {
    const inscripcion = await Inscripcion.findOne({
      where: { cursoId: tarea.cursoId, estudianteId: usuario.id, activa: true },
    });
    return inscripcion ? tarea : null;
  }
  return null;
}

async function crearRubrica(req, res) {
  try {
    const { tareaId, titulo, descripcion, puntajeTotal } = req.body;
    if (!tareaId || !titulo || puntajeTotal === undefined) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const tarea = await Tarea.findOne({ where: { id: tareaId }, include: [{ association: 'curso' }] });
    if (!tarea || tarea.curso.docenteId !== req.usuario.id) {
      return res.status(404).json({ error: 'Tarea no encontrada o no pertenece a este docente.' });
    }

    const existente = await Rubrica.findOne({ where: { tareaId } });
    if (existente) {
      return res.status(400).json({ error: 'Esta tarea ya tiene una rubrica.' });
    }

    const rubrica = await Rubrica.create({ tareaId, titulo, descripcion, puntajeTotal });
    return res.status(201).json(rubrica);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function obtenerRubricaDeTarea(req, res) {
  try {
    const { tareaId } = req.params;

    const tarea = await obtenerTareaConAcceso(tareaId, req.usuario);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada o no tienes acceso a ella.' });
    }

    const rubrica = await Rubrica.findOne({ where: { tareaId } });
    if (!rubrica) {
      return res.status(404).json({ error: 'Esta tarea aun no tiene rubrica.' });
    }

    return res.json(rubrica);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function editarRubrica(req, res) {
  try {
    const { id } = req.params;
    const { titulo, descripcion, puntajeTotal } = req.body;

    const rubrica = await Rubrica.findOne({
      where: { id },
      include: [{ association: 'tarea', include: [{ association: 'curso' }] }],
    });
    if (!rubrica) {
      return res.status(404).json({ error: 'Rubrica no encontrada.' });
    }

    const esDuenoDelCurso = rubrica.tarea.curso.docenteId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDuenoDelCurso) {
      return res.status(404).json({ error: 'Rubrica no encontrada.' });
    }

    const cambios = {};
    if (titulo !== undefined) cambios.titulo = titulo;
    if (descripcion !== undefined) cambios.descripcion = descripcion;
    if (puntajeTotal !== undefined) cambios.puntajeTotal = puntajeTotal;

    await rubrica.update(cambios);
    return res.json(rubrica);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function eliminarRubrica(req, res) {
  try {
    const { id } = req.params;

    const rubrica = await Rubrica.findOne({
      where: { id },
      include: [{ association: 'tarea', include: [{ association: 'curso' }] }],
    });
    if (!rubrica) {
      return res.status(404).json({ error: 'Rubrica no encontrada.' });
    }

    const esDuenoDelCurso = rubrica.tarea.curso.docenteId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDuenoDelCurso) {
      return res.status(404).json({ error: 'Rubrica no encontrada.' });
    }

    await rubrica.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { crearRubrica, obtenerRubricaDeTarea, editarRubrica, eliminarRubrica };
