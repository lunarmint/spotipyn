import json
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
    """The Flask backend to render the player object."""

    # Fetch the OAuth2 object.
    auth_manager = get_auth_manager()

    # Initialize the Spotify object to do stuffs.
    spotify = spotipy.Spotify(auth_manager=auth_manager)

    # Get the access token value from the token dict in OAuth2 object.
    access_token = auth_manager.get_access_token()["access_token"]

    # Get the current user info dict.
    spotify_user = spotify.current_user()

    # Connect to the database.
    db = database.Database().get()

    # Get the users table.
    users = db["users"]

    # Find the user from the table with a specified ID.
    user = users.find_one(user_id=spotify_user["id"])

    # If the user does not exist, initialize their entry in the database.
    if not user:
        user_json = create_user()
        user = users.insert(dict(user_id=spotify_user["id"], value=user_json))

    # Load the JSON object in the "value" field.
    pins = json.loads(user["value"])

    # TODO: Do stuffs with the unpacked JSON object.

    # Dump the modified JSON into the db and close it.
    pins_json = json.dumps(pins)
    users.update(dict(id=user["id"], value=pins_json), ["id"])
    db.commit()
    db.close()

    return render_template("player.html", spotify=spotify, access_token=access_token)
