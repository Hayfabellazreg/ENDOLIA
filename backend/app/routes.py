from flask import Blueprint, jsonify, request
from . import db
from .models import User

api = Blueprint("api", __name__, url_prefix="/api")


@api.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint - verifies API and DB connectivity."""
    try:
        # Try a simple DB query
        db.session.execute(db.text("SELECT 1"))
        return jsonify({
            "status": "ok",
            "api": "running",
            "database": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "api": "running",
            "database": "disconnected",
            "error": str(e)
        }), 500


@api.route("/users", methods=["GET"])
def get_users():
    """Get all users."""
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200


@api.route("/users", methods=["POST"])
def create_user():
    """Create a new user."""
    data = request.get_json()
    if not data or not data.get("username") or not data.get("email"):
        return jsonify({"error": "username and email are required"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 409

    user = User(username=data["username"], email=data["email"])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201
