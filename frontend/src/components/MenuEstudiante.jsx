import { NavLink } from 'react-router-dom';

// Componente reutilizable 300: menu lateral del estudiante.
const OPCIONES = [
  { texto: 'Inicio', ruta: '/panel-estudiante' },
  { texto: 'Mis cursos', ruta: '/mis-cursos' },
  { texto: 'Dashboard', ruta: '/dashboard-estudiante' },
  { texto: 'Notificaciones', ruta: '/notificaciones-estudiante' },
];

function MenuEstudiante() {
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

export default MenuEstudiante;
