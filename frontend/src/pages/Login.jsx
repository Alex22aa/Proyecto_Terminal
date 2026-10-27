import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../api';
import { guardarSesion } from '../utils/sesion';
import './Auth.css';

// Pantalla IU-01: inicio de sesion.
function Login() {
  const navigate = useNavigate();
  const [correoInstitucional, setCorreoInstitucional] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    setCargando(true);
    try {
      const sesion = await iniciarSesion(correoInstitucional, contrasena);
      guardarSesion(sesion);
      navigate(sesion.rol === 'docente' ? '/panel-docente' : '/panel-estudiante');
    } catch {
      setError('Correo o contrasena incorrectos.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-contenedor">
      <form className="auth-tarjeta" onSubmit={manejarEnvio}>
        <h1>Sistema Inteligente de Apoyo y Aprendizaje</h1>
        <p className="auth-texto">Acceso autorizado para estudiantes y docentes registrados.</p>
        <label>
          Correo institucional:
          <input
            type="email"
            value={correoInstitucional}
            onChange={(e) => setCorreoInstitucional(e.target.value)}
            required
          />
        </label>
        <label>
          Contrasena:
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-boton-principal" disabled={cargando}>
          {cargando ? 'Entrando...' : 'Iniciar sesion'}
        </button>
        <button type="button" className="auth-boton-secundario" onClick={() => navigate('/registro')}>
          Registrar usuario
        </button>
        <button
          type="button"
          className="auth-boton-secundario"
          onClick={() => navigate('/recuperar-contrasena')}
        >
          ¿Olvidaste tu contrasena?
        </button>
      </form>
    </div>
  );
}

export default Login;
