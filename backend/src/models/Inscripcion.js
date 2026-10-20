// MODEL: Inscripcion
// Entidad asociativa (tabla puente) que resuelve la relacion muchos-a-muchos
// entre estudiantes y cursos (RF-11).

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Curso = require('./Curso');

const Inscripcion = sequelize.define(
  'Inscripcion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    estudianteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cursoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fechaInscripcion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'inscripciones',
    timestamps: true,
  }
);

// Relaciones: un estudiante puede tener muchas inscripciones; un curso tambien.
// ON DELETE CASCADE porque una inscripcion no tiene sentido sin su estudiante
// o su curso (igual que en el diccionario de datos).
Usuario.hasMany(Inscripcion, { foreignKey: 'estudianteId', onDelete: 'CASCADE' });
Inscripcion.belongsTo(Usuario, { foreignKey: 'estudianteId', as: 'estudiante', onDelete: 'CASCADE' });

Curso.hasMany(Inscripcion, { foreignKey: 'cursoId', onDelete: 'CASCADE' });
Inscripcion.belongsTo(Curso, { foreignKey: 'cursoId', as: 'curso', onDelete: 'CASCADE' });

module.exports = Inscripcion;
