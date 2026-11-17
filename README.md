# ENDOLIA — Full Stack App

> Flask · React · PostgreSQL

## 🗂️ Structure

```
ENDOLIA/
├── backend/        # Flask API (Python)
│   ├── app/        # Application package
│   ├── venv/       # Environnement virtuel Python
│   ├── .env        # Variables d'environnement
│   └── run.py      # Point d'entrée
│
└── frontend/       # React app (Vite)
    ├── src/        # Code source React
    └── ...
```

## 🚀 Démarrage rapide

### Backend (Flask)
```bash
cd backend
# Activer l'environnement virtuel
.\venv\Scripts\python.exe run.py

# Ou avec Flask CLI
$env:FLASK_APP='run.py'
.\venv\Scripts\python.exe -m flask run
```

### Frontend (React)
```bash
cd frontend
npm run dev
```

### Accès
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:5000
- **Health Check** : http://localhost:5000/api/health

## 🔧 Variables d'environnement (backend/.env)

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `SECRET_KEY` | Clé secrète Flask |
| `FLASK_ENV` | `development` ou `production` |

## 📦 Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + Vite + Axios |
| Backend | Flask 3 + SQLAlchemy + Flask-Migrate |
| Base de données | PostgreSQL 18 |
| ORM | SQLAlchemy 2.x |
| Migrations | Alembic via Flask-Migrate |
