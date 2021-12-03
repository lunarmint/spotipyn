import json
import logging
import time
from datetime import datetime, timezone

import spotipy
from flask import Blueprint

from utils import database
from utils.auth import get_auth_manager

log = logging.getLogger(__name__)

database_blueprint = Blueprint("database_blueprint", __name__, template_folder="templates", static_folder="static")


@database_blueprint.route("/database/<data>", methods=["POST"])
def add_pin(data):
    # Fetch the OAuth2 object.
    auth_manager = get_auth_manager()

    # Initialize the Spotify object to do stuffs.
    spotify = spotipy.Spotify(auth_manager=auth_manager)

    # Get the current user info dict.
    spotify_user = spotify.current_user()

    # Connect to the database.
    db = database.Database().get()

    # Get the pins table.
    pins = db["pins"]

    data_json = json.loads(data)
    current_time = int(time.time())
    end_time = current_time + int(data_json["minutes"]) * 60 + int(data_json["seconds"])

    # If the user does not exist, initialize their entry in the database.
    pins.insert(dict(user_id=spotify_user["id"], timestamp=current_time, value=data, end_time=end_time, sent=False))

    db.commit()
    db.close()

    return ""


@database_blueprint.route("/loop")
def check_pins():
    # Fetch the OAuth2 object.
    auth_manager = get_auth_manager()

    # Initialize the Spotify object to do stuffs.
    spotify = spotipy.Spotify(auth_manager=auth_manager)

    # Get the current user info dict.
    spotify_user = spotify.current_user()

    # Get the current UNIX time to compare.
    current_time = datetime.now(tz=timezone.utc).timestamp()

    # Connect to the database.
    db = database.Database().get()

    # Get the pins table.
    pins = db["pins"]

    # Find the unsent pins by user ID.
    results = pins.find(user_id=spotify_user["id"], sent=False)

    # Iterate through the found results, reorganize the values to be used into a new dictionary, and update the database.
    data = {}
    for index, result in enumerate(results):
        value = json.loads(result["value"])
        data[index] = {
            "song": value["song"],
            "mode": value["mode"],
            "message": value["message"],
            "end_time": result["end_time"],
        }
        if result["end_time"] <= current_time:
            pins.update(dict(id=result["id"], sent=True), ["id"])

    # If no results are found, close the database and return.
    if not results:
        return db.close()

    # Dump the dictionary into a JSON object before returning it.
    data_json = json.dumps(data)

    # Commit the changes and close the database.
    db.commit()
    db.close()

    return data_json
