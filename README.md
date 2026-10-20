# Sistema Inteligente de Apoyo y Aprendizaje con Evaluación Asistida por IA

Proyecto Terminal (PT2) — Alejandro Aguilar Hernández, Ingeniería en Computación, UAM Cuajimalpa.

## Decisiones de arquitectura (PT2)

- **Arquitectura de backend:** MVC (Model - Controller, con la Vista delegada a React vía respuestas JSON).
- **Frontend:** React (creado con Vite).
- **Backend:** Node.js + Express.
- **Base de datos:** PostgreSQL, mediante el ORM Sequelize (capa Model).
- **Comunicación:** API REST (`/frontend` nunca habla directo con la base de datos, solo con `/backend`).

Este esqueleto incluye dos entidades de ejemplo (`Usuario` y `Curso`) para mostrar el patrón
funcionando de punta a punta (Model → Controller → Route → respuesta JSON → consumo en React).
El resto de las entidades (Tarea, Entrega, Rúbrica, Calificación, Retroalimentación, Diagnóstico,
Recomendación, etc.) se agregarán siguiendo el mismo patrón, una vez que el diagrama
entidad-relación del Capítulo IV esté definido.

## Estructura del proyecto

```
proyecto-terminal-pt2/
├── backend/                 # API REST en Node/Express, organizada en MVC
│   └── src/
│       ├── config/          # Conexión a la base de datos
│       ├── models/          # Capa Model (Sequelize)
│       ├── controllers/     # Capa Controller (lógica de negocio)
│       ├── routes/          # Definición de endpoints
│       ├── middleware/      # Autenticación y control de roles
│       ├── app.js
│       └── server.js
└── frontend/                 # Aplicación React (Vite)
    └── src/
        ├── api.js           # Cliente que consume la API REST del backend
        ├── App.jsx
        └── main.jsx
```

## Cómo correrlo localmente

### 1. Base de datos
Crea una base de datos vacía en tu PostgreSQL local, por ejemplo `sistema_apoyo_aprendizaje`.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # y ajusta usuario/contraseña de tu PostgreSQL
npm run dev
```
Debería quedar corriendo en `http://localhost:4000`. Prueba `http://localhost:4000/api/health`.

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Debería quedar corriendo en `http://localhost:5173`.

## Próximos pasos (para no perder el hilo)

1. Definir el diagrama entidad-relación completo (Capítulo IV de la tesina).
2. Agregar el resto de los modelos siguiendo el patrón de `Usuario.js` y `Curso.js`.
3. Agregar sus controllers y routes correspondientes.
4. Documentar la arquitectura y el diagrama ER en el Capítulo IV.
5. Subir este repositorio a GitHub (separado de la carpeta de documentos/diagramas en OneDrive).
