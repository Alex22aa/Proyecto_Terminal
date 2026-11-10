import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitarRecuperacion, restablecerContrasena } from '../api';
import './Auth.css';

// Pantalla IU-32: recuperacion de contrasena.
// El proyecto no tiene servicio de correo configurado (eso queda fuera del
// alcance de PT2), asi que en vez de enviar un correo real el enlace de
// recuperacion se muestra aqui mismo en pantalla. Por eso "pedir recuperacion"
// y "poner la contrasena nueva" viven en la misma pantalla: no hay una IU
// aparte para esto en los 33 bosquejos. Decision de Alejandro, 09/11/2026.
function RecuperarContrasena() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [correoInstitucional, setCorreoInstitucional] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tokenRecuperacion, setTokenRecuperacion] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);

  async function manejarSolicitar(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const respuesta = await solicitarRecuperacion(correoInstitucional);
      setMensaje(respuesta.mensaje);
      if (respuesta.tokenRecuperacion) {
        setTokenRecuperacion(respuesta.tokenRecuperacion);
      }
      setPaso(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function manejarRestablecer(evento) {
    evento.preventDefault();
    setError('');
    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setEnviando(true);
    try {
      await restablecerContrasena(tokenRecuperacion, nuevaContrasena);
      setListo(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <div className="auth-contenedor">
        <div className="auth-tarjeta">
          <h1>Sistema Inteligente de Apoyo y Aprendizaje</h1>
          <p className="auth-texto">Tu contraseña se actualizó correctamente.</p>
          <button className="auth-boton-principal" onClick={() => navigate('/login')}>
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-contenedor">
      <form className="auth-tarjeta" onSubmit={paso === 1 ? manejarSolicitar : manejarRestablecer}>
        <h1>Sistema Inteligente de Apoyo y Aprendizaje</h1>
        <h2 className="auth-subtitulo">Recuperación de contraseña</h2>

        {paso === 1 && (
          <>
            <p className="auth-texto">
              Ingresa tu correo institucional para recibir instrucciones de recuperación de acceso.
            </p>
            <label>
              Correo institucional:
              <input
                type="email"
                value={correoInstitucional}
                onChange={(e) => setCorreoInstitucional(e.target.value)}
                required
              />
            </label>
          </>
        )}

        {paso === 2 && (
          <>
            <p className="auth-texto">{mensaje}</p>
            {tokenRecuperacion && (
              <p className="auth-texto">
                El sistema aún no tiene servicio de correo configurado, así que tu enlace de
                recuperación se muestra directo aquí (válido por 1 hora):
                <br />
                <strong>{tokenRecuperacion}</strong>
              </p>
            )}
            <label>
              Enlace de recuperación:
              <input
                value={tokenRecuperacion}
                onChange={(e) => setTokenRecuperacion(e.target.value)}
                required
              />
            </label>
            <label>
              Nueva contraseña:
              <input
                type="password"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                required
              />
            </label>
            <label>
              Confirmar contraseña:
              <input
                type="password"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                required
              />
            </label>
          </>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-boton-principal" disabled={enviando}>
          {paso === 1 ? 'Enviar' : 'Restablecer contraseña'}
        </button>
        <button type="button" className="auth-boton-secundario" onClick={() => navigate('/login')}>
          Volver
        </button>
      </form>
    </div>
  );
}

export default RecuperarContrasena;
