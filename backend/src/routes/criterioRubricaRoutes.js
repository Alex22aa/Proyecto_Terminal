const { Router } = require('express');
const {
  crearCriterio,
  listarCriteriosDeRubrica,
  editarCriterio,
  eliminarCriterio,
} = require('../controllers/criterioRubricaController');
const { requiereAutenticacion, requiereRol } = require('../middleware/authMiddleware');

const router = Router();

router.use(requiereAutenticacion);

router.get('/rubrica/:rubricaId', listarCriteriosDeRubrica);
router.post('/', requiereRol('docente'), crearCriterio);
router.put('/:id', requiereRol('docente', 'administrador'), editarCriterio);
router.delete('/:id', requiereRol('docente', 'administrador'), eliminarCriterio);

module.exports = router;
