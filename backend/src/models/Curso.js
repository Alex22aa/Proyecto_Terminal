// MODEL: Curso
// Representa un curso administrado por un docente (RF-07, RF-08, RF-11).
// Ejemplo minimo para mostrar el patron; se ampliara con el diagrama ER.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const Curso = sequelize.define(
  'Curso',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grupo: DataTypes.STRING,
    trimestre: DataTypes.STRING,
    descripcion: DataTypes.TEXT,
    estado: {
      type: DataTypes.ENUM('activo', 'archivado'),
      defaultValue: 'activo',
    },
  },
  {
    tableName: 'cursos',
    timestamps: true,
  }
);

// Relacion: un docente (Usuario) puede tener muchos cursos.
Usuario.hasMany(Curso, { foreignKey: 'docenteId' });
Curso.belongsTo(Usuario, { foreignKey: 'docenteId', as: 'docente' });

module.exports = Curso;
