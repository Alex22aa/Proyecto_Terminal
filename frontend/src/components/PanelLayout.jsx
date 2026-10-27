import BarraSuperior from './BarraSuperior';
import MenuDocente from './MenuDocente';
import MenuEstudiante from './MenuEstudiante';
import './Panel.css';

// Estructura compartida por toda pantalla con sesion iniciada: usa el menu
// lateral segun el rol (componentes 300/301) y la barra superior (302).
function PanelLayout({ rol, children }) {
  return (
    <div className="panel-layout">
      <BarraSuperior />
      <div className="panel-cuerpo">
        {rol === 'docente' ? <MenuDocente /> : <MenuEstudiante />}
        <main className="panel-contenido">{children}</main>
      </div>
    </div>
  );
}

export default PanelLayout;
