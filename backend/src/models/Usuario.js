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
    // Matricula del estudiante (IU-15). El bosquejo de registro (IU-31) no la
    // pide, asi que no se captura ahi; queda nula hasta que se registre a
    // mano (por ejemplo desde pgAdmin) para las cuentas que la necesiten.
    matricula: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    tableName: 'usuarios',
    timestamps: true,
  }
);

module.exports = Usuario;
