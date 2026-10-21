// CONTROLLER: Curso
// Logica de negocio para gestionar cursos (RF-07, RF-08, RF-11).
//
// Politica de permisos:
// - Crear: solo el docente, a su propio nombre.
// - Consultar: el docente ve sus propios cursos; el administrador ve todos.
// - Editar/Archivar: el docente dueno del curso, o el administrador (sin
//   necesidad de ser dueno).

const { Curso } = require('../models');

async function crearCurso(req, res) {
  try {
    const { nombre, grupo, trimestre, descripcion } = req.body;
    const docenteId = req.usuario.id; // viene del middleware de autenticacion

    const curso = await Curso.create({ nombre, grupo, trimestre, descripcion, docenteId });
    return res.status(201).json(curso);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function listarCursos(req, res) {
  try {
    // El administrador ve todos los cursos (con el nombre del docente dueno);
    // el docente solo ve los suyos.
    if (req.usuario.rol === 'administrador') {
      const cursos = await Curso.findAll({
        include: [{ association: 'docente', attributes: ['id', 'nombreCompleto', 'correoInstitucional'] }],
      });
      return res.json(cursos);
    }

    const docenteId = req.usuario.id;
    const cursos = await Curso.findAll({ where: { docenteId } });
    return res.json(cursos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function editarCurso(req, res) {
  try {
    const { id } = req.params;
    const { nombre, grupo, trimestre, descripcion } = req.body;

    // El administrador puede editar cualquier curso; el docente solo el suyo.
    const where = req.usuario.rol === 'administrador' ? { id } : { id, docenteId: req.usuario.id };
    const curso = await Curso.findOne({ where });
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado o no pertenece a este docente.' });
    }

    // Solo se actualizan los campos que de verdad llegaron en la peticion,
    // para no borrar por accidente algo que no se queria tocar.
    const cambios = {};
    if (nombre !== undefined) cambios.nombre = nombre;
    if (grupo !== undefined) cambios.grupo = grupo;
    if (trimestre !== undefined) cambios.trimestre = trimestre;
    if (descripcion !== undefined) cambios.descripcion = descripcion;

    await curso.update(cambios);
    return res.json(curso);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function archivarCurso(req, res) {
  try {
    const { id } = req.params;

    const where = req.usuario.rol === 'administrador' ? { id } : { id, docenteId: req.usuario.id };
    const curso = await Curso.findOne({ where });
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado o no pertenece a este docente.' });
    }

    await curso.update({ estado: 'archivado' });
    return res.json(curso);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { crearCurso, listarCursos, editarCurso, archivarCurso };
