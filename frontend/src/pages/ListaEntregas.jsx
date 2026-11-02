import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerTareasDelCurso, obtenerEntregasDeTarea } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-11: lista de entregas de una tarea (vista del docente).
function ListaEntregas() {
  const { cursoId, tareaId } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [tarea, setTarea] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareaId]);

  async function cargar() {
    setCargando(true);
    const [tareas, listaEntregas] = await Promise.all([
      obtenerTareasDelCurso(sesion?.token, cursoId),
      obtenerEntregasDeTarea(sesion?.token, tareaId),
    ]);
    setTarea(tareas.find((t) => String(t.id) === tareaId));
    setEntregas(listaEntregas);
    setCargando(false);
  }

  function nombreEstado(estado) {
    if (estado === 'calificada') return 'Calificada';
    if (estado === 'entregada') return 'Entregada';
    return 'Pendiente';
  }

  const entregasFiltradas = entregas.filter((entrega) =>
    (entrega.estudiante?.nombreCompleto || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <PanelLayout rol="docente">
      {tarea && <p className="tareas-curso-tag">Tarea: {tarea.titulo}</p>}
      <h1>Lista de entregas</h1>
      <p className="cursos-subtitulo">Entregas asociadas a la tarea seleccionada</p>

      <input
        className="cursos-buscador"
        placeholder="Buscar estudiante o entrega"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando && <p>Cargando entregas...</p>}

      {!cargando && entregasFiltradas.length > 0 && (
        <table className="entregas-tabla">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Fecha de entrega</th>
              <th>Estado</th>
              <th>Calificación</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entregasFiltradas.map((entrega) => (
              <tr key={entrega.id}>
                <td>{entrega.estudiante?.nombreCompleto}</td>
                <td>{new Date(entrega.fechaEntrega).toLocaleDateString('es-MX')}</td>
                <td>{nombreEstado(entrega.estado)}</td>
                <td>{entrega.puntajeObtenido ?? ''}</td>
                <td>
                  <button
                    className="cursos-boton-secundario"
                    onClick={() =>
                      navigate(`/cursos/${cursoId}/tareas/${tareaId}/entregas/${entrega.id}`)
                    }
                  >
                    Ver entrega
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!cargando && entregasFiltradas.length === 0 && <p>Todavía no hay entregas para esta tarea.</p>}

      <div className="cursos-acciones">
        <button
          className="cursos-boton-secundario"
          onClick={() => navigate(`/cursos/${cursoId}/tareas/${tareaId}`)}
        >
          Volver a tarea
        </button>
      </div>
    </PanelLayout>
  );
}

export default ListaEntregas;
