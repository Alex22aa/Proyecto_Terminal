// CONTROLLER: Auth
// Logica de negocio para registro e inicio de sesion (RF-01, RF-02, RF-03).

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

async function registrar(req, res) {
  try {
    const { nombreCompleto, correoInstitucional, contrasena, rol } = req.body;

    if (!nombreCompleto || !correoInstitucional || !contrasena || !rol) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    const usuario = await Usuario.create({
      nombreCompleto,
      correoInstitucional,
      contrasenaHash,
      rol,
    });

    return res.status(201).json({
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      correoInstitucional: usuario.correoInstitucional,
      rol: usuario.rol,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function iniciarSesion(req, res) {
  try {
    const { correoInstitucional, contrasena } = req.body;

    const usuario = await Usuario.findOne({ where: { correoInstitucional } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales invalidas.' });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasenaHash);
    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Credenciales invalidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({ token, rol: usuario.rol, nombreCompleto: usuario.nombreCompleto });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { registrar, iniciarSesion };
