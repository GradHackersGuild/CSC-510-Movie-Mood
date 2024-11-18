# pylint: disable=cyclic-import
"""
Copyright (c) 2023 Makarand Pundlik, Varun Varatharajan, Michelle Varghese
This code is licensed under MIT license (see LICENSE for details)

@author: PopcornPicks
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_login import LoginManager
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = '5791628bb0b13ce0c676dfde280ba245'
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_DATABASE_URI'] = (
    'postgresql://varun:7nv0cMCeEdSsLpvtcQGjJTDM6ymhsHL9@'
    'dpg-cssk118gph6c7396k3bg-a.oregon-postgres.render.com/'
    'prod_tq0i'
)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
socket = SocketIO(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'
cors = CORS(app, resources={
    r"/*": {
        "origins": "*"
    }
})

#pylint: disable=wrong-import-position
from src import routes
