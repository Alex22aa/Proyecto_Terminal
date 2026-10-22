// CONTROLLER: CriterioRubrica
// Permisos: igual que Rubrica, pero un nivel mas abajo (Rubrica -> Tarea -> Curso).

const { CriterioRubrica, Rubrica, Inscripcion } = require('../models');

// Busca la rubrica con su tarea y curso, y revisa si quien pregunta puede verla.
async function obtenerRubricaConAcceso(rubricaId, usuario) {
  const rubrica = await Rubrica.findOne({
    where: { id: rubricaId },
    include: [{ association: 'tarea', include: [{ association: 'curso' }] }],
  });
  if (!rubrica) return null;

  const curso = rubrica.tarea.curso;

  if (usuario.rol === 'administrador') return rubrica;
  if (usuario.rol === 'docente') return curso.docenteId === usuario.id ? rubrica : null;
  if (usuario.rol === 'estudiante') {
    const inscripcion = await Inscripcion.findOne({
      where: { cursoId: curso.id, estudianteId: usuario.id, activa: true },
    });
    return inscripcion ? rubrica : null;
  }
  return null;
}

async function crearCriterio(req, res) {
  try {
    const { rubricaId, nombre, descripcion, puntajeMaximo } = req.body;
    if (!rubricaId || !nombre || puntajeMaximo === undefined) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const rubrica = await Rubrica.findOne({
      where: { id: rubricaId },
      include: [{ association: 'tarea', include: [{ association: 'curso' }] }],
    });
    if (!rubrica || rubrica.tarea.curso.docenteId !== req.usuario.id) {
      return res.status(404).json({ error: 'Rubrica no encontrada o no pertenece a este docente.' });
    }

    const criterio = await CriterioRubrica.create({ rubricaId, nombre, descripcion, puntajeMaximo });
    return res.status(201).json(criterio);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function listarCriteriosDeRubrica(req, res) {
  try {
    const { rubricaId } = req.params;

    const rubrica = await obtenerRubricaConAcceso(rubricaId, req.usuario);
    if (!rubrica) {
      return res.status(404).json({ error: 'Rubrica no encontrada o no tienes acceso a ella.' });
    }

    const criterios = await CriterioRubrica.findAll({ where: { rubricaId } });
    return res.json(criterios);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function editarCriterio(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, puntajeMaximo } = req.body;

    const criterio = await CriterioRubrica.findOne({
      where: { id },
      include: [{ association: 'rubrica', include: [{ association: 'tarea', include: [{ association: 'curso' }] }] }],
    });
    if (!criterio) {
      return res.status(404).json({ error: 'Criterio no encontrado.' });
    }

    const esDuenoDelCurso = criterio.rubrica.tarea.curso.docenteId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDuenoDelCurso) {
      return res.status(404).json({ error: 'Criterio no encontrado.' });
    }

    const cambios = {};
    if (nombre !== undefined) cambios.nombre = nombre;
    if (descripcion !== undefined) cambios.descripcion = descripcion;
    if (puntajeMaximo !== undefined) cambios.puntajeMaximo = puntajeMaximo;

    await criterio.update(cambios);
    return res.json(criterio);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function eliminarCriterio(req, res) {
  try {
    const { id } = req.params;

    const criterio = await CriterioRubrica.findOne({
      where: { id },
      include: [{ association: 'rubrica', include: [{ association: 'tarea', include: [{ association: 'curso' }] }] }],
    });
    if (!criterio) {
      return res.status(404).json({ error: 'Criterio no encontrado.' });
    }

    const esDuenoDelCurso = criterio.rubrica.tarea.curso.docenteId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDuenoDelCurso) {
      return res.status(404).json({ error: 'Criterio no encontrado.' });
    }

    await criterio.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { crearCriterio, listarCriteriosDeRubrica, editarCriterio, eliminarCriterio };
