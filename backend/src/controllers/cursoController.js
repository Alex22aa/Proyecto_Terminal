// CONTROLLER: Curso
// Logica de negocio para gestionar cursos (RF-07, RF-08, RF-11).

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

async function listarCursosDelDocente(req, res) {
  try {
    const docenteId = req.usuario.id;
    const cursos = await Curso.findAll({ where: { docenteId } });
    return res.json(cursos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { crearCurso, listarCursosDelDocente };
