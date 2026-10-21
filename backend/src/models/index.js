// Punto central de acceso a los modelos (capa Model del MVC).
// A medida que agregues entidades (Rubrica, CriterioRubrica, Entrega...)
// impórtalas aquí para que todo el proyecto las consuma desde un solo lugar.

const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Curso = require('./Curso');
const Inscripcion = require('./Inscripcion');
const Material = require('./Material');
const Tarea = require('./Tarea');

module.exports = {
  sequelize,
  Usuario,
  Curso,
  Inscripcion,
  Material,
  Tarea,
};
