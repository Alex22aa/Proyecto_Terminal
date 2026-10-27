import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../api';
import './Auth.css';

// Pantalla IU-31: registro de un usuario nuevo (estudiante o docente).
function Registro() {
  const navigate = useNavigate();
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correoInstitucional, setCorreoInstitucional] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [rol, setRol] = useState('estudiante');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    if (contrasena !== confirmarContrasena) {
      setError('Las contrasenas no coinciden.');
      return;
    }
    setCargando(true);
    try {
      await registrarUsuario({ nombreCompleto, correoInstitucional, contrasena, rol });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-contenedor">
      <form className="auth-tarjeta" onSubmit={manejarEnvio}>
        <h1>Sistema Inteligente de Apoyo y Aprendizaje</h1>
        <p className="auth-texto">Crea una cuenta para acceder a la plataforma.</p>
        <h2 className="auth-subtitulo">Registro de usuario</h2>
        <label>
          Nombre completo:
          <input value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
        </label>
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
        <label>
          Confirmar contrasena:
          <input
            type="password"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            required
          />
        </label>
        <label>
          Tipo de usuario:
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="docente">Docente</option>
            <option value="estudiante">Estudiante</option>
          </select>
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-boton-principal" disabled={cargando}>
          {cargando ? 'Registrando...' : 'Registrar usuario'}
        </button>
        <button type="button" className="auth-boton-secundario" onClick={() => navigate('/login')}>
          Volver
        </button>
      </form>
    </div>
  );
}

export default Registro;
