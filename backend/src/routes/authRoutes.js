const { Router } = require('express');
const { registrar, iniciarSesion } = require('../controllers/authController');

const router = Router();

router.post('/registro', registrar);
router.post('/login', iniciarSesion);

module.exports = router;
