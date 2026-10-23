// CONTROLLER: Notificacion
// Politica de permisos (distinta a las demas, igual que Entrega):
// - Crear: el docente o el administrador, dirigida a cualquier usuario.
// - Consultar: cada usuario ve solo las suyas; el administrador puede ver
//   las de cualquiera.
// - Marcar como leida / eliminar: el propio destinatario, o el administrador.

const { Notificacion, Usuario } = require('../models');

async function crearNotificacion(req, res) {
  try {
    const { usuarioId, mensaje, tipo } = req.body;
    if (!usuarioId || !mensaje || !tipo) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    const destinatario = await Usuario.findByPk(usuarioId);
    if (!destinatario) {
      return res.status(404).json({ error: 'El usuario destinatario no existe.' });
    }

    const notificacion = await Notificacion.create({ usuarioId, mensaje, tipo });
    return res.status(201).json(notificacion);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function listarMisNotificaciones(req, res) {
  try {
    const notificaciones = await Notificacion.findAll({
      where: { usuarioId: req.usuario.id },
      order: [['fechaCreacion', 'DESC']],
    });
    return res.json(notificaciones);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function marcarLeida(req, res) {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findOne({ where: { id } });
    if (!notificacion) {
      return res.status(404).json({ error: 'Notificacion no encontrada.' });
    }

    const esDestinatario = notificacion.usuarioId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDestinatario) {
      return res.status(404).json({ error: 'Notificacion no encontrada.' });
    }

    await notificacion.update({ leida: true });
    return res.json(notificacion);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function eliminarNotificacion(req, res) {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findOne({ where: { id } });
    if (!notificacion) {
      return res.status(404).json({ error: 'Notificacion no encontrada.' });
    }

    const esDestinatario = notificacion.usuarioId === req.usuario.id;
    if (req.usuario.rol !== 'administrador' && !esDestinatario) {
      return res.status(404).json({ error: 'Notificacion no encontrada.' });
    }

    await notificacion.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { crearNotificacion, listarMisNotificaciones, marcarLeida, eliminarNotificacion };
