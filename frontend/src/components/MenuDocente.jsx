import { NavLink } from 'react-router-dom';

// Componente reutilizable 301: menú lateral del docente.
const OPCIONES = [
  { texto: 'Inicio', ruta: '/panel-docente' },
  { texto: 'Cursos', ruta: '/cursos' },
  { texto: 'Dashboard', ruta: '/dashboard-docente' },
  { texto: 'Evaluación asistida', ruta: '/evaluacion-asistida' },
  { texto: 'Diagnósticos IA', ruta: '/diagnosticos-ia' },
  { texto: 'Notificaciones', ruta: '/notificaciones-docente' },
];

function MenuDocente() {
  return (
    <nav className="menu-lateral">
      {OPCIONES.map((opcion) => (
        <NavLink
          key={opcion.ruta}
          to={opcion.ruta}
          className={({ isActive }) => 'menu-opcion' + (isActive ? ' activa' : '')}
        >
          {opcion.texto}
        </NavLink>
      ))}
    </nav>
  );
}

export default MenuDocente;
