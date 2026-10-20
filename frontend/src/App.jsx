import { useState } from 'react';
import { iniciarSesion, registrarUsuario, crearCurso, obtenerCursos } from './api';

// Cuenta fija de prueba (docente demo). Si no existe todavia en la base de
// datos, el panel la crea automaticamente al primer intento de conexion.
const DOCENTE_DEMO = {
  nombreCompleto: 'Docente Demo',
  correoInstitucional: 'docente.demo@uam.mx',
  contrasena: 'Demo1234',
  rol: 'docente',
};

function App() {
  const [token, setToken] = useState(null);
  const [nombreDocente, setNombreDocente] = useState('');
  const [cursos, setCursos] = useState([]);
  const [mensaje, setMensaje] = useState('Aun no has iniciado sesion.');
  const [cargando, setCargando] = useState(false);

  async function cargarCursos(tokenActual) {
    const lista = await obtenerCursos(tokenActual ?? token);
    setCursos(lista);
  }

  // OJO: esto NO "conecta" el backend a la base de datos -- esa conexion ya la
  // hizo el backend por su cuenta, solo, al arrancar con "npm run dev"
  // (revisa server.js). Esto es el login normal de un docente: el frontend le
  // manda sus credenciales al backend, igual que haria cualquier usuario real.
  async function iniciarSesionDemo() {
    setCargando(true);
    setMensaje('Iniciando sesion como Docente Demo...');
    try {
      let sesion;
      try {
        sesion = await iniciarSesion(DOCENTE_DEMO.correoInstitucional, DOCENTE_DEMO.contrasena);
      } catch {
        // La cuenta demo todavia no existe en la base de datos: la registramos.
        setMensaje('La cuenta demo no existia todavia, registrandola...');
        await registrarUsuario(DOCENTE_DEMO);
        sesion = await iniciarSesion(DOCENTE_DEMO.correoInstitucional, DOCENTE_DEMO.contrasena);
      }
      setToken(sesion.token);
      setNombreDocente(sesion.nombreCompleto);
      setMensaje(
        `Sesion iniciada como ${sesion.nombreCompleto}. El backend valido las credenciales contra la tabla "usuarios" en PostgreSQL y devolvio un token.`
      );
      await cargarCursos(sesion.token);
    } catch (error) {
      setMensaje(
        `No se pudo iniciar sesion: ${error.message}. Revisa que el backend (npm run dev en /backend) y PostgreSQL esten corriendo.`
      );
    } finally {
      setCargando(false);
    }
  }

  async function crearCurso() {
    setCargando(true);
    setMensaje('Creando un curso de prueba en PostgreSQL...');
    try {
      const nuevoCurso = await crearCurso(token, {
        nombre: `Curso de prueba ${new Date().toLocaleTimeString('es-MX')}`,
        grupo: 'Grupo Demo',
        trimestre: '2026-Otono',
        descripcion:
          'Curso creado desde el panel de demostracion para mostrar la conexion React -> Express -> PostgreSQL.',
      });
      setMensaje(`Curso creado con id ${nuevoCurso.id} y guardado en la tabla "cursos". Actualizando la lista...`);
      await cargarCursos();
    } catch (error) {
      setMensaje(`No se pudo crear el curso: ${error.message}`);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={estilos.contenedor}>
      <h1 style={estilos.titulo}>Demo: Sistema de Apoyo al Aprendizaje</h1>
      <p style={estilos.subtitulo}>
        Este panel prueba, en vivo, la conexion completa: React (localhost:5173) &rarr; Express
        (localhost:4000) &rarr; PostgreSQL.
      </p>

      <div style={estilos.paso}>
        <h2 style={estilos.subtituloPaso}>1. Iniciar sesion (Docente Demo)</h2>
        <button style={estilos.boton} onClick={iniciarSesionDemo} disabled={cargando}>
          {token ? 'Volver a iniciar sesion' : 'Iniciar sesion'}
        </button>
        {nombreDocente && <p style={estilos.ayuda}>Sesion activa: {nombreDocente} (rol: docente)</p>}
      </div>

      <div style={estilos.paso}>
        <h2 style={estilos.subtituloPaso}>2. Crear un curso de prueba</h2>
        <button style={estilos.boton} onClick={crearCurso} disabled={!token || cargando}>
          Crear curso de prueba
        </button>
        {!token && <p style={estilos.ayuda}>Primero inicia sesion en el paso 1.</p>}
      </div>

      <div style={estilos.paso}>
        <h2 style={estilos.subtituloPaso}>3. Cursos guardados en la base de datos</h2>
        <button style={estilos.boton} onClick={() => cargarCursos()} disabled={!token || cargando}>
          Actualizar lista
        </button>
        {cursos.length === 0 ? (
          <p style={estilos.ayuda}>Todavia no hay cursos que mostrar.</p>
        ) : (
          <table style={estilos.tabla}>
            <thead>
              <tr>
                <th style={estilos.celda}>ID</th>
                <th style={estilos.celda}>Nombre</th>
                <th style={estilos.celda}>Grupo</th>
                <th style={estilos.celda}>Trimestre</th>
                <th style={estilos.celda}>Creado</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso) => (
                <tr key={curso.id}>
                  <td style={estilos.celda}>{curso.id}</td>
                  <td style={estilos.celda}>{curso.nombre}</td>
                  <td style={estilos.celda}>{curso.grupo}</td>
                  <td style={estilos.celda}>{curso.trimestre}</td>
                  <td style={estilos.celda}>{new Date(curso.createdAt).toLocaleString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={estilos.estado}>
        <strong>Estado:</strong> {mensaje}
      </div>
    </div>
  );
}

const estilos = {
  contenedor: {
    maxWidth: 720,
    margin: '40px auto',
    padding: '0 20px 40px',
    fontFamily: 'system-ui, sans-serif',
    color: '#1f2937',
  },
  titulo: { fontSize: 24, marginBottom: 4 },
  subtitulo: { color: '#4b5563', marginBottom: 24 },
  subtituloPaso: { fontSize: 16, margin: '0 0 10px' },
  paso: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 },
  boton: {
    padding: '8px 16px',
    fontSize: 14,
    borderRadius: 6,
    border: '1px solid #2563eb',
    background: '#2563eb',
    color: '#fff',
    cursor: 'pointer',
  },
  ayuda: { color: '#6b7280', fontSize: 13, marginTop: 8 },
  tabla: { width: '100%', marginTop: 12, borderCollapse: 'collapse' },
  celda: { border: '1px solid #e5e7eb', padding: '6px 8px', textAlign: 'left', fontSize: 13 },
  estado: { marginTop: 24, padding: 12, background: '#f3f4f6', borderRadius: 8, fontSize: 14 },
};

export default App;
