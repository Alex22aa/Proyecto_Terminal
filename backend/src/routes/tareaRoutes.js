const { Router } = require('express');
const {
  crearTarea,
  listarTareasDelCurso,
  editarTarea,
  desactivarTarea,
} = require('../controllers/tareaController');
const { requiereAutenticacion, requiereRol } = require('../middleware/authMiddleware');

const router = Router();

router.use(requiereAutenticacion);

// La verificacion de quien puede CONSULTAR (docente dueno, estudiante inscrito
// o administrador) se hace dentro del controller, porque depende del curso.
router.get('/curso/:cursoId', listarTareasDelCurso);

router.post('/', requiereRol('docente'), crearTarea);
router.put('/:id', requiereRol('docente', 'administrador'), editarTarea);
router.patch('/:id/desactivar', requiereRol('docente', 'administrador'), desactivarTarea);

module.exports = router;
