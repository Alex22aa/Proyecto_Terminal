// CONTROLLER: Inscripcion
// Logica de negocio para asociar estudiantes a cursos (RF-11).
//
// Politica de permisos:
// - Crear: solo el docente, a su propio nombre (dueno del curso).
// - Consultar inscripciones de un curso: el docente dueno, o el administrador.
// - Dar de baja (eliminar): el docente dueno del curso, o el administrador.

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
    const { cursoId } = req.params;

    // El administrador puede consultar las inscripciones de cualquier curso;
    // el docente solo las del suyo.
    const where = req.usuario.rol === 'administrador'
      ? { id: cursoId }
      : { id: cursoId, docenteId: req.usuario.id };
    const curso = await Curso.findOne({ where });
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

async function cancelarInscripcion(req, res) {
  try {
    const { id } = req.params;

    const inscripcion = await Inscripcion.findOne({
      where: { id },
      include: [{ association: 'curso' }],
    });
    if (!inscripcion) {
      return res.status(404).json({ error: 'Inscripcion no encontrada.' });
    }

    // El administrador puede dar de baja cualquier inscripcion; el docente
    // solo las de sus propios cursos.
    const esDuenoDelCurso = inscripcion.curso.docenteId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDuenoDelCurso) {
      return res.status(404).json({ error: 'Inscripcion no encontrada.' });
    }

    await inscripcion.update({ activa: false });
    return res.json(inscripcion);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { crearInscripcion, listarInscripcionesDelCurso, listarMisCursos, cancelarInscripcion };
