import logging

import spotipy
from flask import Blueprint, render_template

from utils import database
from utils.auth import get_auth_manager
from utils.user_template import create_user

log = logging.getLogger(__name__)

player_blueprint = Blueprint(
    "player_blueprint",
    __name__,
    template_folder="templates",
    static_folder="static",
    url_prefix="/player",
)


@player_blueprint.route("/")
def player():
    auth_manager = get_auth_manager()
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    spotify_user = spotify.current_user()

    access_token = auth_manager.get_access_token()["access_token"]

    db = database.Database().get()
    pins = db["pins"]
    user = pins.find_one(user_id=spotify_user["id"])

    if not user:
        user_json = create_user()
        pins.insert(dict(user_id=spotify_user["id"], value=user_json))

    db.commit()
    db.close()

    return render_template("player.html", spotify=spotify, access_token=access_token)
