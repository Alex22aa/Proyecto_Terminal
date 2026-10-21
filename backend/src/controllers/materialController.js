// CONTROLLER: Material
// Logica de negocio para los materiales de apoyo de un curso (RF-08).
//
// Politica de permisos:
// - Crear: solo el docente, a su propio nombre (dueno del curso).
// - Consultar: el docente dueno, el estudiante inscrito (activo) en el curso,
//   o el administrador (siempre).
// - Editar/Eliminar: el docente dueno del curso, o el administrador.

const { Material, Curso, Inscripcion } = require('../models');

async function crearMaterial(req, res) {
  try {
    const { cursoId, titulo, tipo, url, descripcion } = req.body;
    if (!cursoId || !titulo || !tipo || !url) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const docenteId = req.usuario.id;
    const curso = await Curso.findOne({ where: { id: cursoId, docenteId } });
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado o no pertenece a este docente.' });
    }

    const material = await Material.create({ cursoId, titulo, tipo, url, descripcion });
    return res.status(201).json(material);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Verifica si quien pregunta tiene derecho a ver los materiales de este curso:
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

async function listarMaterialesDelCurso(req, res) {
  try {
    const { cursoId } = req.params;

    const curso = await obtenerCursoConAcceso(cursoId, req.usuario);
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado o no tienes acceso a sus materiales.' });
    }

    const materiales = await Material.findAll({ where: { cursoId } });
    return res.json(materiales);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function editarMaterial(req, res) {
  try {
    const { id } = req.params;
    const { titulo, tipo, url, descripcion } = req.body;

    const material = await Material.findOne({ where: { id }, include: [{ association: 'curso' }] });
    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado.' });
    }

    const esDuenoDelCurso = material.curso.docenteId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDuenoDelCurso) {
      return res.status(404).json({ error: 'Material no encontrado.' });
    }

    const cambios = {};
    if (titulo !== undefined) cambios.titulo = titulo;
    if (tipo !== undefined) cambios.tipo = tipo;
    if (url !== undefined) cambios.url = url;
    if (descripcion !== undefined) cambios.descripcion = descripcion;

    await material.update(cambios);
    return res.json(material);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function eliminarMaterial(req, res) {
  try {
    const { id } = req.params;

    const material = await Material.findOne({ where: { id }, include: [{ association: 'curso' }] });
    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado.' });
    }

    const esDuenoDelCurso = material.curso.docenteId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDuenoDelCurso) {
      return res.status(404).json({ error: 'Material no encontrado.' });
    }

    await material.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { crearMaterial, listarMaterialesDelCurso, editarMaterial, eliminarMaterial };
