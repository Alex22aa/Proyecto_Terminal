const { Router } = require('express');
const {
  crearNotificacion,
  listarMisNotificaciones,
  marcarLeida,
  eliminarNotificacion,
} = require('../controllers/notificacionController');
const { requiereAutenticacion, requiereRol } = require('../middleware/authMiddleware');

const router = Router();

router.use(requiereAutenticacion);

router.post('/', requiereRol('docente', 'administrador'), crearNotificacion);
router.get('/mis-notificaciones', listarMisNotificaciones);
router.patch('/:id/marcar-leida', marcarLeida);
router.delete('/:id', eliminarNotificacion);

module.exports = router;
