// MODEL: Notificacion
// Avisos que recibe un usuario dentro del sistema (nuevas tareas,
// calificaciones, recomendaciones, avisos del sistema, etc.) (RF del Cap. II).

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const Notificacion = sequelize.define(
  'Notificacion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    leida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'notificaciones',
    timestamps: true,
  }
);

// Relacion: un usuario puede recibir muchas notificaciones. ON DELETE CASCADE
// porque una notificacion no tiene sentido sin su destinatario.
Usuario.hasMany(Notificacion, { foreignKey: 'usuarioId', as: 'notificaciones', onDelete: 'CASCADE' });
Notificacion.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario', onDelete: 'CASCADE' });

module.exports = Notificacion;
