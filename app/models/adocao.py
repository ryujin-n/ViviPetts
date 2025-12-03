from app.app import db

class Adocao(db.Model):
    __tablename__ = 'adocoes'

    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animais.id'), nullable=False)
    pessoa_id = db.Column(db.Integer, db.ForeignKey('pessoas.id'), nullable=False)
    data_adocao = db.Column(db.String(20))
    termo = db.Column(db.String(200))
    status = db.Column(db.String(50))
    obs = db.Column(db.String(200))

    animal = db.relationship('Animal', back_populates='adocoes')
    pessoa = db.relationship('Pessoa', back_populates='adocoes')

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'pessoa_id': self.pessoa_id,
            'data_adocao': self.data_adocao,
            'termo': self.termo,
            'status': self.status,
            'obs': self.obs
        }
