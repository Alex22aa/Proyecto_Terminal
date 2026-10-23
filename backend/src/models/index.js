// Acceso central a los modelos.
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Curso = require('./Curso');
const Inscripcion = require('./Inscripcion');
const Material = require('./Material');
const Tarea = require('./Tarea');
const Rubrica = require('./Rubrica');
const CriterioRubrica = require('./CriterioRubrica');
const Entrega = require('./Entrega');

module.exports = {
  sequelize,
  Usuario,
  Curso,
  Inscripcion,
  Material,
  Tarea,
  Rubrica,
  CriterioRubrica,
  Entrega,
};
