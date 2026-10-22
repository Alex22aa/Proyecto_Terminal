// Configuracion de Express: middlewares y rutas.
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const inscripcionRoutes = require('./routes/inscripcionRoutes');
const materialRoutes = require('./routes/materialRoutes');
const tareaRoutes = require('./routes/tareaRoutes');
const rubricaRoutes = require('./routes/rubricaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mensaje: 'API del Sistema Inteligente de Apoyo y Aprendizaje' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/materiales', materialRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/rubricas', rubricaRoutes);

module.exports = app;
