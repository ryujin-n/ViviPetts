from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ong.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app)
    db.init_app(app)

    # register blueprints
    from app.routes.animais_api import animais_bp
    from app.routes.pessoas_api import pessoas_bp
    from app.routes.adocoes_api import adocoes_bp
    from app.routes.tratamentos_api import tratamentos_bp
    from app.routes.doacoes_api import doacoes_bp

    app.register_blueprint(animais_bp, url_prefix='/api/animais')
    app.register_blueprint(pessoas_bp, url_prefix='/api/pessoas')
    app.register_blueprint(adocoes_bp, url_prefix='/api/adocoes')
    app.register_blueprint(tratamentos_bp, url_prefix='/api/tratamentos')
    app.register_blueprint(doacoes_bp, url_prefix='/api/doacoes')

    return app


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # create tables
        from app import models  # import models so they are registered
        db.create_all()
    app.run(debug=True)
