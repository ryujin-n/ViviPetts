from flask import Blueprint, request, jsonify
from app.app import db
from app.models.doacao import Doacao

doacoes_bp = Blueprint('doacoes_bp', __name__)

@doacoes_bp.route('/', methods=['GET'])
def listar_doacoes():
    doacoes = Doacao.query.all()
    return jsonify([d.to_dict() for d in doacoes])

@doacoes_bp.route('/', methods=['POST'])
def criar_doacao():
    data = request.get_json() or request.form
    doacao = Doacao(
        pessoa_id=data.get('pessoa_id'),
        data_doacao=data.get('data_doacao'),
        valor_doacao=data.get('valor_doacao'),
        tipo_doacao=data.get('tipo_doacao'),
        obs_doacao=data.get('obs_doacao')
    )
    db.session.add(doacao)
    db.session.commit()
    return jsonify(doacao.to_dict()), 201

@doacoes_bp.route('/<int:id>', methods=['PUT'])
def atualizar_doacao(id):
    data = request.get_json() or request.form
    doacao = Doacao.query.get_or_404(id)

    doacao.doador_id = data.get('doador_id', doacao.doador_id)
    doacao.tipo_doacao = data.get('tipo_doacao', doacao.tipo_doacao)
    doacao.valor = data.get('valor', doacao.valor)
    doacao.data_doacao = data.get('data_doacao', doacao.data_doacao)

    db.session.commit()

    return jsonify(doacao.to_dict())


@doacoes_bp.route('/<int:id>', methods=['DELETE'])
def deletar_doacao(id):
    doacao = Doacao.query.get_or_404(id)
    db.session.delete(doacao)
    db.session.commit()
    return jsonify({'message':'Doação deletada'})
