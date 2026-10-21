// Punto central de acceso a los modelos (capa Model del MVC).
// A medida que agregues entidades (Tarea, Entrega, Rubrica, Calificacion...)
// impórtalas aquí para que todo el proyecto las consuma desde un solo lugar.

const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Curso = require('./Curso');
const Inscripcion = require('./Inscripcion');
const Material = require('./Material');

module.exports = {
  sequelize,
  Usuario,
  Curso,
  Inscripcion,
  Material,
};
