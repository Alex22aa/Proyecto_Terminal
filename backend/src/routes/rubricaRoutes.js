const { Router } = require('express');
const {
  crearRubrica,
  obtenerRubricaDeTarea,
  editarRubrica,
  eliminarRubrica,
} = require('../controllers/rubricaController');
const { requiereAutenticacion, requiereRol } = require('../middleware/authMiddleware');

const router = Router();

router.use(requiereAutenticacion);

router.get('/tarea/:tareaId', obtenerRubricaDeTarea);
router.post('/', requiereRol('docente'), crearRubrica);
router.put('/:id', requiereRol('docente', 'administrador'), editarRubrica);
router.delete('/:id', requiereRol('docente', 'administrador'), eliminarRubrica);

module.exports = router;
