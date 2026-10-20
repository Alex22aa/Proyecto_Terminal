// Configuracion de la conexion a la base de datos (PostgreSQL) usando Sequelize.
// Sequelize es el ORM que nos da la capa "Model" del patron MVC: convierte
// clases de JavaScript en tablas de la base de datos, sin que tengamos que
// escribir SQL a mano para las operaciones basicas (CRUD).

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // ponlo en console.log si quieres ver el SQL que genera Sequelize
  }
);

module.exports = sequelize;
