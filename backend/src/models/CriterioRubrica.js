// MODEL: CriterioRubrica
// Un criterio de evaluacion dentro de una rubrica.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Rubrica = require('./Rubrica');

const CriterioRubrica = sequelize.define(
  'CriterioRubrica',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rubricaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    puntajeMaximo: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'criterios_rubrica',
    timestamps: true,
  }
);

Rubrica.hasMany(CriterioRubrica, { foreignKey: 'rubricaId', onDelete: 'CASCADE' });
CriterioRubrica.belongsTo(Rubrica, { foreignKey: 'rubricaId', as: 'rubrica', onDelete: 'CASCADE' });

module.exports = CriterioRubrica;
