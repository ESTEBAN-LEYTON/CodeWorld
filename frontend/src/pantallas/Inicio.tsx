interface Props {
  onAlumno: () => void
  onTutor: () => void
}

export function Inicio({ onAlumno, onTutor }: Props) {
  return (
    <main className="centrado">
      <div className="tarjeta portada">
        <h1 className="logo">CodeWorld</h1>
        <p className="lema">Aprende a programar resolviendo desafíos con bloques.</p>
        <div className="opciones">
          <button className="opcion" onClick={onAlumno}>
            <span className="icono" aria-hidden>🧩</span>
            <strong>Soy alumno</strong>
            <small>Entra con el usuario que te dio tu tutor</small>
          </button>
          <button className="opcion" onClick={onTutor}>
            <span className="icono" aria-hidden>🛡️</span>
            <strong>Soy tutor</strong>
            <small>Registra alumnos y revisa su progreso</small>
          </button>
        </div>
      </div>
    </main>
  )
}
