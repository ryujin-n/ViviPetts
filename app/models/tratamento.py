from app.app import db

class Tratamento(db.Model):
    __tablename__ = 'tratamentos'

    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animais.id'), nullable=False)
    data_tratamento = db.Column(db.String(20))
    tipo_tratamento = db.Column(db.String(100))
    valor_tratamento = db.Column(db.Float)
    status_tratamento = db.Column(db.String(50))

    animal = db.relationship('Animal', back_populates='tratamentos')

    def to_dict(self):
        return {
            'id': self.id,
            'animal_id': self.animal_id,
            'animal_nome': self.animal.nome if self.animal else None,
            'data_tratamento': self.data_tratamento,
            'tipo_tratamento': self.tipo_tratamento,
            'valor_tratamento': self.valor_tratamento,
            'status_tratamento': self.status_tratamento
        }