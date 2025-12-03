from app.app import db

class Animal(db.Model):
    __tablename__ = 'animais'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), nullable=False)
    especie = db.Column(db.String(50))
    sexo = db.Column(db.String(10))
    nascimento = db.Column(db.String(20))
    resgate = db.Column(db.String(20))
    microchip = db.Column(db.String(50))
    status = db.Column(db.String(50))
    obs = db.Column(db.Text)

    adocoes = db.relationship('Adocao', back_populates='animal', cascade='all, delete-orphan')
    tratamentos = db.relationship('Tratamento', back_populates='animal', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'especie': self.especie,
            'sexo': self.sexo,
            'nascimento': self.nascimento,
            'resgate': self.resgate,
            'microchip': self.microchip,
            'status': self.status,
            'obs': self.obs
        }
