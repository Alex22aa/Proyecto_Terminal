const { Router } = require('express');
const {
  crearEntrega,
  actualizarEntrega,
  calificarEntrega,
  listarEntregasDeTarea,
  obtenerMiEntrega,
} = require('../controllers/entregaController');
const { requiereAutenticacion, requiereRol } = require('../middleware/authMiddleware');

const router = Router();

router.use(requiereAutenticacion);

router.post('/', requiereRol('estudiante'), crearEntrega);
router.put('/:id', requiereRol('estudiante'), actualizarEntrega);
router.patch('/:id/calificar', requiereRol('docente', 'administrador'), calificarEntrega);
router.get('/tarea/:tareaId', listarEntregasDeTarea);
router.get('/mi-entrega/:tareaId', requiereRol('estudiante'), obtenerMiEntrega);

module.exports = router;
