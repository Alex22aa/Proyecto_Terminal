const { Router } = require('express');
const { crearCurso, listarCursosDelDocente } = require('../controllers/cursoController');
const { requiereAutenticacion, requiereRol } = require('../middleware/authMiddleware');

const router = Router();

// Todas las rutas de curso requieren estar autenticado.
router.use(requiereAutenticacion);

router.get('/', listarCursosDelDocente);
router.post('/', requiereRol('docente'), crearCurso);

module.exports = router;
