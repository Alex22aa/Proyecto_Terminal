// MODEL: Rubrica
// Rubrica de evaluacion de una tarea (una por tarea).

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tarea = require('./Tarea');

const Rubrica = sequelize.define(
  'Rubrica',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tareaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    puntajeTotal: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'rubricas',
    timestamps: true,
  }
);

Tarea.hasOne(Rubrica, { foreignKey: 'tareaId', onDelete: 'CASCADE' });
Rubrica.belongsTo(Tarea, { foreignKey: 'tareaId', as: 'tarea', onDelete: 'CASCADE' });

module.exports = Rubrica;
