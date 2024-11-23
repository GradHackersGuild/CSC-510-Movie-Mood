from src import app, db
from src.models import Watchlist
with app.app_context():
    db.create_all()

# with app.app_context():
#     Watchlist.__table__.drop(db.engine)