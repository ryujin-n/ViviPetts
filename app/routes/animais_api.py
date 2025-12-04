from flask import Blueprint, request, jsonify
from app.app import db
from app.models.animal import Animal

animais_bp = Blueprint('animais_bp', __name__)

@animais_bp.route('/', methods=['GET'])
def listar_animais():
    animais = Animal.query.all()
    return jsonify([a.to_dict() for a in animais])

@animais_bp.route('/<int:id>', methods=['GET'])
def obter_animal(id):
    animal = Animal.query.get_or_404(id)
    return jsonify(animal.to_dict())

@animais_bp.route('/', methods=['POST'])
def criar_animal():
    data = request.get_json() or request.form
    animal = Animal(
        nome=data.get('nome'),
        especie=data.get('especie'),
        sexo=data.get('sexo'),
        nascimento=data.get('nascimento'),
        resgate=data.get('resgate'),
        microchip=data.get('microchip'),
        status=data.get('status'),
        obs=data.get('obs')
    )
    db.session.add(animal)
    db.session.commit()
    return jsonify(animal.to_dict()), 201

@animais_bp.route('/<int:id>', methods=['PUT'])
def atualizar_animal(id):
    animal = Animal.query.get_or_404(id)
    data = request.get_json() or request.form

    animal.nome = data.get('nome', animal.nome)
    animal.especie = data.get('especie', animal.especie)
    animal.sexo = data.get('sexo', animal.sexo)
    animal.nascimento = data.get('nascimento', animal.nascimento)
    animal.resgate = data.get('resgate', animal.resgate)
    animal.microchip = data.get('microchip', animal.microchip)
    animal.status = data.get('status', animal.status)
    animal.obs = data.get('obs', animal.obs)

    db.session.commit()
    return jsonify(animal.to_dict())

@animais_bp.route('/<int:id>', methods=['DELETE'])
def deletar_animal(id):
    animal = Animal.query.get_or_404(id)
    db.session.delete(animal)
    db.session.commit()
    return jsonify({'message': 'Animal deletado'})
