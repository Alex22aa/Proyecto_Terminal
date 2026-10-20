// Middleware de autenticacion: valida el token JWT en cada peticion protegida
// y adjunta los datos del usuario a req.usuario para que los controllers los usen.
// Tambien sirve para diferenciar permisos por rol (RNF-04).

const jwt = require('jsonwebtoken');

function requiereAutenticacion(req, res, next) {
  const encabezado = req.headers.authorization;
  if (!encabezado) {
    return res.status(401).json({ error: 'No se proporciono un token.' });
  }

  const token = encabezado.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, rol }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalido o expirado.' });
  }
}

function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esta accion.' });
    }
    next();
  };
}

module.exports = { requiereAutenticacion, requiereRol };
