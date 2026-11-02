import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

// Pantalla IU-32: recuperación de contraseña.
// Todavía es solo visual: el backend aún no tiene un endpoint para esto.
function RecuperarContrasena() {
  const navigate = useNavigate();
  const [correoInstitucional, setCorreoInstitucional] = useState('');
  const [enviado, setEnviado] = useState(false);

  function manejarEnvio(evento) {
    evento.preventDefault();
    setEnviado(true);
  }

  return (
    <div className="auth-contenedor">
      <form className="auth-tarjeta" onSubmit={manejarEnvio}>
        <h1>Sistema Inteligente de Apoyo y Aprendizaje</h1>
        <p className="auth-texto">
          Ingresa tu correo institucional para recibir instrucciones de recuperación de acceso.
        </p>
        <h2 className="auth-subtitulo">Recuperación de contraseña</h2>
        <label>
          Correo institucional:
          <input
            type="email"
            value={correoInstitucional}
            onChange={(e) => setCorreoInstitucional(e.target.value)}
            required
          />
        </label>
        <p className="auth-error">
          El sistema enviará instrucciones al correo registrado si la cuenta existe.
        </p>
        {enviado && (
          <p className="auth-texto">
            Pantalla aún sin conectar: cuando el backend tenga este endpoint, aquí se enviará el correo.
          </p>
        )}
        <button type="submit" className="auth-boton-principal">
          Enviar
        </button>
        <button type="button" className="auth-boton-secundario" onClick={() => navigate('/login')}>
          Volver
        </button>
      </form>
    </div>
  );
}

export default RecuperarContrasena;
