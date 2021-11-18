import logging

from flask import Flask
from flask_session import Session
from utils.config import config

from modules.login.login import login_blueprint
from modules.logout.logout import logout_blueprint
from modules.pin.pin import pin_blueprint

log = logging.getLogger(__name__)


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config["spotify"]["secret_key"]
    app.config["SESSION_TYPE"] = "filesystem"
    app.config["SESSION_FILE_DIR"] = "./.flask_session/"
    # app.register_blueprint(login_blueprint, **{"url_defaults": {"/": None}})
    app.register_blueprint(login_blueprint)
    app.register_blueprint(logout_blueprint)
    app.register_blueprint(pin_blueprint)
    Session(app)
    return app
