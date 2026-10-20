const { Router } = require('express');
const {
  crearInscripcion,
  listarInscripcionesDelCurso,
  listarMisCursos,
} = require('../controllers/inscripcionController');
const { requiereAutenticacion, requiereRol } = require('../middleware/authMiddleware');

const router = Router();

// Todas las rutas de inscripcion requieren estar autenticado.
router.use(requiereAutenticacion);

router.post('/', requiereRol('docente'), crearInscripcion);
router.get('/curso/:cursoId', requiereRol('docente'), listarInscripcionesDelCurso);
router.get('/mis-cursos', requiereRol('estudiante'), listarMisCursos);

module.exports = router;
