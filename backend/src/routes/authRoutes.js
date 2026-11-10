const { Router } = require('express');
const {
  registrar,
  iniciarSesion,
  solicitarRecuperacion,
  restablecerContrasena,
} = require('../controllers/authController');

const router = Router();

router.post('/registro', registrar);
router.post('/login', iniciarSesion);
router.post('/recuperar', solicitarRecuperacion);
router.post('/restablecer', restablecerContrasena);

module.exports = router;
