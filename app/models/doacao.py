from app.app import db

class Doacao(db.Model):
    __tablename__ = 'doacoes'

    id = db.Column(db.Integer, primary_key=True)
    pessoa_id = db.Column(db.Integer, db.ForeignKey('pessoas.id'), nullable=False)
    data_doacao = db.Column(db.String(20))
    valor_doacao = db.Column(db.Float)
    tipo_doacao = db.Column(db.String(50))
    obs_doacao = db.Column(db.Text)

    pessoa = db.relationship('Pessoa', back_populates='doacoes')

    def to_dict(self):
        return {
            'id': self.id,
            'pessoa_id': self.pessoa_id,
            'data_doacao': self.data_doacao,
            'valor_doacao': self.valor_doacao,
            'tipo_doacao': self.tipo_doacao,
            'obs_doacao': self.obs_doacao
        }
