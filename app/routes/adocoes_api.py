from flask import Blueprint, request, jsonify
from app.app import db
from app.models.adocao import Adocao
from app.models.animal import Animal

adocoes_bp = Blueprint('adocoes_bp', __name__)

@adocoes_bp.route('/', methods=['GET'])
def listar_adocoes():
    adocoes = Adocao.query.all()
    return jsonify([a.to_dict() for a in adocoes])

@adocoes_bp.route('/<int:id>', methods=['GET'])
def obter_adocao(id):
    adocao = Adocao.query.get_or_404(id)
    return jsonify(adocao.to_dict())

@adocoes_bp.route('/', methods=['POST'])
def criar_adocao():
    data = request.get_json() or request.form
    animal = Animal.query.get_or_404(data.get('animal_id'))
    animal.status = data.get('status_adocao')  
    adocao = Adocao(
        animal_id=data.get('animal_id'),
        pessoa_id=data.get('pessoa_id'),
        data_adocao=data.get('data_adocao'),
        termo=data.get('termo'),
        status_adocao=data.get('status_adocao')
    )

    db.session.add(adocao)
    db.session.commit()
    return jsonify(adocao.to_dict()), 201

@adocoes_bp.route('/<int:id>', methods=['PUT'])
def atualizar_adocao(id):
    data = request.get_json() or request.form
    adocao = Adocao.query.get_or_404(id)

    adocao.animal_id = data.get('animal_id', adocao.animal_id)
    adocao.pessoa_id = data.get('pessoa_id', adocao.pessoa_id)
    adocao.data_adocao = data.get('data_adocao', adocao.data_adocao)
    adocao.status_adocao = data.get('status_adocao', adocao.status_adocao)
    adocao.termo = data.get('termo', adocao.termo)

    animal = Animal.query.get(adocao.animal_id)
    if animal:
        animal.status = adocao.status_adocao
    db.session.commit()
    return jsonify(adocao.to_dict())

@adocoes_bp.route('/<int:id>', methods=['DELETE'])
def deletar_adocao(id):
    adocao = Adocao.query.get_or_404(id)
    animal = Animal.query.get(adocao.animal_id)
    if animal:
        animal.status = 'Disponível'
    db.session.delete(adocao)
    db.session.commit()
    return jsonify({'message': 'Adoção deletada'})
