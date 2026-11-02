// Pantalla genérica para secciones del menú que todavía no se han construido.
function EnConstruccion({ titulo }) {
  return (
    <div>
      <h1>{titulo}</h1>
      <p>Esta sección se construirá en un siguiente paso.</p>
    </div>
  );
}

export default EnConstruccion;
