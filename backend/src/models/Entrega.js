// MODEL: Entrega
// Lo que un estudiante entrega para una tarea, mas su calificacion y
// retroalimentacion (RF-10). En el diccionario de datos original esto eran
// 3 tablas separadas (Entregas, Calificaciones, Retroalimentaciones), pero
// al reducir a 11 entidades se unieron en una sola.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Tarea = require('./Tarea');
const Usuario = require('./Usuario');

const Entrega = sequelize.define(
  'Entrega',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tareaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estudianteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    archivoUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fechaEntrega: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    docenteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    puntajeObtenido: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fechaCalificacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'entregas',
    timestamps: true,
  }
);

// Relacion: una tarea puede tener muchas entregas. ON DELETE CASCADE porque
// una entrega no tiene sentido sin su tarea.
Tarea.hasMany(Entrega, { foreignKey: 'tareaId', onDelete: 'CASCADE' });
Entrega.belongsTo(Tarea, { foreignKey: 'tareaId', as: 'tarea', onDelete: 'CASCADE' });

// Relacion: un estudiante puede tener muchas entregas.
Usuario.hasMany(Entrega, { foreignKey: 'estudianteId', as: 'entregas', onDelete: 'CASCADE' });
Entrega.belongsTo(Usuario, { foreignKey: 'estudianteId', as: 'estudiante', onDelete: 'CASCADE' });

// Relacion: un docente puede calificar muchas entregas.
Usuario.hasMany(Entrega, { foreignKey: 'docenteId', as: 'entregasCalificadas' });
Entrega.belongsTo(Usuario, { foreignKey: 'docenteId', as: 'docente' });

module.exports = Entrega;
