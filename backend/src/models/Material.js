// MODEL: Material
// Recursos de apoyo (lecturas, presentaciones, videos, enlaces, etc.) que el
// docente publica dentro de un curso (RF-08).

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Curso = require('./Curso');

const Material = sequelize.define(
  'Material',
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
    tipo: {
      // Ej.: 'PDF', 'video', 'enlace', 'presentacion'.
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fechaPublicacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'materiales',
    timestamps: true,
  }
);

// Relacion: un curso puede tener muchos materiales. ON DELETE CASCADE porque
// un material no tiene sentido sin su curso (igual que en el diccionario de
// datos: MATERIALES depende de CURSOS).
Curso.hasMany(Material, { foreignKey: 'cursoId', onDelete: 'CASCADE' });
Material.belongsTo(Curso, { foreignKey: 'cursoId', as: 'curso', onDelete: 'CASCADE' });

module.exports = Material;
