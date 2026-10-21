// MODEL: Usuario
// Representa a estudiantes, docentes y administradores del sistema.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define(
  'Usuario',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreCompleto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correoInstitucional: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    contrasenaHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM('estudiante', 'docente', 'administrador'),
      allowNull: false,
    },
  },
  {
    tableName: 'usuarios',
    timestamps: true,
  }
);

module.exports = Usuario;
