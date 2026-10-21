const { Router } = require('express');
const {
  crearInscripcion,
  listarInscripcionesDelCurso,
  listarMisCursos,
  cancelarInscripcion,
} = require('../controllers/inscripcionController');
const { requiereAutenticacion, requiereRol } = require('../middleware/authMiddleware');

const router = Router();

router.use(requiereAutenticacion);

router.post('/', requiereRol('docente'), crearInscripcion);
router.get('/curso/:cursoId', requiereRol('docente', 'administrador'), listarInscripcionesDelCurso);
router.get('/mis-cursos', requiereRol('estudiante'), listarMisCursos);
router.patch('/:id/cancelar', requiereRol('docente', 'administrador'), cancelarInscripcion);

module.exports = router;
