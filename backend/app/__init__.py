from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()


def create_app():
    app = Flask(__name__)

    # Load configuration
    from .config import Config
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}})

    # Import models so Flask-Migrate can detect them
    from . import models  # noqa: F401

    # Register blueprints
    from .routes import api
    app.register_blueprint(api)

    @app.route("/")
    def index():
        return {"message": "ENDOLIA API is running 🚀", "docs": "/api/health"}

    return app
