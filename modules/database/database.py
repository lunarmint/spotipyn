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

    # Close the connection if the "song" value is not found, due to the user creating the pin before the player could load, or
    # the account does not have premium and no song is detected.
    data_json = json.loads(data)
    if not data_json["song"]:
        return db.close()

    current_time = int(time.time())

    if data_json["mode"] == "absolute":
        year = int(data_json["year"]) if int(data_json["year"]) >= 1970 else 1970
        month = int(data_json["month"])
        d = int(data_json["day"])
        match month:
            case 2:
                if year % 4 == 0:
                    day = d if d <= 29 else 29
                else:
                    day = d if d <= 28 else 28
            case 1 | 3 | 5 | 7 | 8 | 10 | 12:
                day = d if d <= 31 else 31
            case _:
                day = d if d <= 30 else 30
        # Band aid fix +5 hours to offset the timezone on the VPS. TODO: Look into this later.
        date_time = datetime(year, int(data_json["month"]), day, int(data_json["hour"]) + 5, int(data_json["minute"]), int(data_json["second"]))
        end_time = date_time.timestamp()
    else:
        end_time = current_time + int(data_json["hour"]) * 3600 + int(data_json["minute"]) * 60 + int(data_json["second"])

    # If the user does not exist, initialize their entry in the database.
    pins.insert(dict(user_id=spotify_user["id"], timestamp=current_time, value=data, end_time=end_time, sent=False))

    # Commit the changes and close the connection.
    db.commit()
    db.close()

    # Return an empty string so that Flask would stop crying about a function not returning anything it wants.
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
