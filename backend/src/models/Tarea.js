// MODEL: Tarea
// Actividades o trabajos que el docente asigna dentro de un curso y que los
// estudiantes deben entregar (RF-09).

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Curso = require('./Curso');

const Tarea = sequelize.define(
  'Tarea',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cursoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fechaEntrega: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    puntajeMaximo: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100.0,
    },
    activa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'tareas',
    timestamps: true,
  }
);

// Relacion: un curso puede tener muchas tareas. ON DELETE CASCADE porque una
// tarea no tiene sentido sin su curso (igual que en el diccionario de datos).
Curso.hasMany(Tarea, { foreignKey: 'cursoId', onDelete: 'CASCADE' });
Tarea.belongsTo(Curso, { foreignKey: 'cursoId', as: 'curso', onDelete: 'CASCADE' });

module.exports = Tarea;
