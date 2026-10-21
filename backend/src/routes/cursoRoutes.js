const { Router } = require('express');
const {
  crearCurso,
  listarCursos,
  editarCurso,
  archivarCurso,
} = require('../controllers/cursoController');
const { requiereAutenticacion, requiereRol } = require('../middleware/authMiddleware');

const router = Router();

// Todas las rutas de curso requieren estar autenticado.
router.use(requiereAutenticacion);

router.get('/', listarCursos);
router.post('/', requiereRol('docente'), crearCurso);
router.put('/:id', requiereRol('docente', 'administrador'), editarCurso);
router.patch('/:id/archivar', requiereRol('docente', 'administrador'), archivarCurso);

module.exports = router;
