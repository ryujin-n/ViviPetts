from app.app import db

class Pessoa(db.Model):
    __tablename__ = 'pessoas'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(30))
    email = db.Column(db.String(120))
    endereco = db.Column(db.String(200))
    tipo = db.Column(db.String(50))
    data = db.Column(db.String(20))
    status = db.Column(db.String(50))

    adocoes = db.relationship('Adocao', back_populates='pessoa', cascade='all, delete-orphan')
    doacoes = db.relationship('Doacao', back_populates='pessoa', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'telefone': self.telefone,
            'email': self.email,
            'endereco': self.endereco,
            'tipo': self.tipo,
            'data': self.data,
            'status': self.status
        }