// CONTROLLER: Auth
// Logica de negocio para registro e inicio de sesion (RF-01, RF-02, RF-03).

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

async function registrar(req, res) {
  try {
    const { nombreCompleto, correoInstitucional, contrasena, rol, matricula } = req.body;

    if (!nombreCompleto || !correoInstitucional || !contrasena || !rol) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuario.create({
      nombreCompleto,
      correoInstitucional,
      contrasenaHash,
      rol,
      matricula: rol === 'estudiante' ? matricula || null : null,
    });

    return res.status(201).json({
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      correoInstitucional: usuario.correoInstitucional,
      rol: usuario.rol,
      matricula: usuario.matricula,
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

// IU-32: pide la recuperacion de contrasena. El proyecto no tiene servicio de
// correo configurado (eso es trabajo aparte, fuera del alcance de PT2), asi
// que en vez de mandar un correo real se regresa el enlace de recuperacion
// directo en la respuesta, para que el frontend lo muestre en pantalla.
async function solicitarRecuperacion(req, res) {
  try {
    const { correoInstitucional } = req.body;
    if (!correoInstitucional) {
      return res.status(400).json({ error: 'Falta el correo institucional.' });
    }

    const usuario = await Usuario.findOne({ where: { correoInstitucional } });
    // Mismo mensaje exista o no la cuenta, para no revelar que correos estan registrados.
    const mensaje = 'Si la cuenta existe, se generaron instrucciones de recuperacion.';
    if (!usuario) {
      return res.json({ mensaje });
    }

    const tokenRecuperacion = jwt.sign(
      { id: usuario.id, proposito: 'recuperacion' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ mensaje, tokenRecuperacion });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// IU-32: usa el enlace de recuperacion para poner una contrasena nueva.
async function restablecerContrasena(req, res) {
  try {
    const { tokenRecuperacion, nuevaContrasena } = req.body;
    if (!tokenRecuperacion || !nuevaContrasena) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    let payload;
    try {
      payload = jwt.verify(tokenRecuperacion, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ error: 'El enlace de recuperacion es invalido o ya vencio.' });
    }
    if (payload.proposito !== 'recuperacion') {
      return res.status(400).json({ error: 'El enlace de recuperacion es invalido.' });
    }

    const usuario = await Usuario.findOne({ where: { id: payload.id } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const contrasenaHash = await bcrypt.hash(nuevaContrasena, 10);
    await usuario.update({ contrasenaHash });

    return res.json({ mensaje: 'Contrasena actualizada correctamente.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { registrar, iniciarSesion, solicitarRecuperacion, restablecerContrasena };
