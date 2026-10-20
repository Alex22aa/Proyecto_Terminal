// Punto de entrada: levanta el servidor y sincroniza los modelos con la BD.

require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log('Conexion a PostgreSQL exitosa.');

    // { alter: true } ajusta las tablas existentes a los modelos durante desarrollo.
    // En un entorno real se usarian migraciones en vez de sync().
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  }
}

iniciar();
