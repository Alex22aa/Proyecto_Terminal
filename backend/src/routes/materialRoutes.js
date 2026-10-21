const { Router } = require('express');
const {
  crearMaterial,
  listarMaterialesDelCurso,
  editarMaterial,
  eliminarMaterial,
} = require('../controllers/materialController');
const { requiereAutenticacion, requiereRol } = require('../middleware/authMiddleware');

const router = Router();

router.use(requiereAutenticacion);

// La verificacion de quien puede CONSULTAR (docente dueno, estudiante inscrito
// o administrador) se hace dentro del controller, porque depende del curso.
router.get('/curso/:cursoId', listarMaterialesDelCurso);

router.post('/', requiereRol('docente'), crearMaterial);
router.put('/:id', requiereRol('docente', 'administrador'), editarMaterial);
router.delete('/:id', requiereRol('docente', 'administrador'), eliminarMaterial);

module.exports = router;
