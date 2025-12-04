from flask import Blueprint, request, jsonify
from app.app import db
from app.models.tratamento import Tratamento

tratamentos_bp = Blueprint('tratamentos_bp', __name__)

@tratamentos_bp.route('/', methods=['GET'])
def listar_tratamentos():
    tratamentos = Tratamento.query.all()
    return jsonify([t.to_dict() for t in tratamentos])

@tratamentos_bp.route('/', methods=['POST'])
def criar_tratamento():
    data = request.get_json() or request.form
    tratamento = Tratamento(
        animal_id=data.get('animal_id'),
        data_tratamento=data.get('data_tratamento'),
        tipo_tratamento=data.get('tipo_tratamento'),
        valor_tratamento=data.get('valor_tratamento'),
        obs_tratamento=data.get('obs_tratamento')
    )
    db.session.add(tratamento)
    db.session.commit()
    return jsonify(tratamento.to_dict()), 201

@tratamentos_bp.route('/<int:id>', methods=['DELETE'])
def deletar_tratamento(id):
    tratamento = Tratamento.query.get_or_404(id)
    db.session.delete(tratamento)
    db.session.commit()
    return jsonify({'message':'Tratamento deletado'})
