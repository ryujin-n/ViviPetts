from flask import Blueprint, request, jsonify
from app.app import db
from app.models.pessoa import Pessoa

pessoas_bp = Blueprint('pessoas_bp', __name__)

@pessoas_bp.route('/', methods=['GET'])
def listar_pessoas():
    pessoas = Pessoa.query.all()
    return jsonify([p.to_dict() for p in pessoas])

@pessoas_bp.route('/<int:id>', methods=['GET'])
def obter_pessoa(id):
    pessoa = Pessoa.query.get_or_404(id)
    return jsonify(pessoa.to_dict())

@pessoas_bp.route('/', methods=['POST'])
def criar_pessoa():
    data = request.get_json() or request.form
    pessoa = Pessoa(
        nome=data.get('nome'),
        telefone=data.get('telefone'),
        email=data.get('email'),
        endereco=data.get('endereco'),
        tipo=data.get('tipo'),
        data=data.get('data'),
        status=data.get('status')
    )
    db.session.add(pessoa)
    db.session.commit()
    return jsonify(pessoa.to_dict()), 201

@pessoas_bp.route('/<int:id>', methods=['PUT'])
def atualizar_pessoa(id):
    pessoa = Pessoa.query.get_or_404(id)
    data = request.get_json() or request.form

    pessoa.nome = data.get('nome', pessoa.nome)
    pessoa.telefone = data.get('telefone', pessoa.telefone)
    pessoa.email = data.get('email', pessoa.email)
    pessoa.endereco = data.get('endereco', pessoa.endereco)
    pessoa.tipo = data.get('tipo', pessoa.tipo)
    pessoa.data = data.get('data', pessoa.data)
    pessoa.status = data.get('status', pessoa.status)

    db.session.commit()
    return jsonify(pessoa.to_dict())

@pessoas_bp.route('/<int:id>', methods=['DELETE'])
def deletar_pessoa(id):
    pessoa = Pessoa.query.get_or_404(id)
    db.session.delete(pessoa)
    db.session.commit()
    return jsonify({'message': 'Pessoa deletada'})
