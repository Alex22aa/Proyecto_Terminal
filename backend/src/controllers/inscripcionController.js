// CONTROLLER: Inscripcion
// Logica de negocio para asociar estudiantes a cursos (RF-11).

const { Inscripcion, Curso } = require('../models');

async function crearInscripcion(req, res) {
  try {
    const { estudianteId, cursoId } = req.body;
    if (!estudianteId || !cursoId) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const docenteId = req.usuario.id; // viene del middleware de autenticacion

    // Verificamos que el curso exista y de verdad sea de este docente,
    // para que un docente no pueda inscribir estudiantes en cursos ajenos.
    const curso = await Curso.findOne({ where: { id: cursoId, docenteId } });
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado o no pertenece a este docente.' });
    }

    const inscripcion = await Inscripcion.create({ estudianteId, cursoId });
    return res.status(201).json(inscripcion);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function listarInscripcionesDelCurso(req, res) {
  try {
    const docenteId = req.usuario.id;
    const { cursoId } = req.params;

    const curso = await Curso.findOne({ where: { id: cursoId, docenteId } });
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado o no pertenece a este docente.' });
    }

    const inscripciones = await Inscripcion.findAll({
      where: { cursoId },
      include: [{ association: 'estudiante', attributes: ['id', 'nombreCompleto', 'correoInstitucional'] }],
    });
    return res.json(inscripciones);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function listarMisCursos(req, res) {
  try {
    const estudianteId = req.usuario.id;

    const inscripciones = await Inscripcion.findAll({
      where: { estudianteId, activa: true },
      include: [{ association: 'curso' }],
    });
    return res.json(inscripciones);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { crearInscripcion, listarInscripcionesDelCurso, listarMisCursos };
