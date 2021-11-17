import json
import spotipy
from utils import database
from utils.auth import get_auth_manager


def create_pin(message, duration, time_stamp):
    auth_manager = get_auth_manager()
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    spotify_user = spotify.current_user()
    track = spotify.current_user_playing_track()

    value_template = {
        "username": spotify_user,
        "track": track,
        "pin_message": message,
        "pin_duration": duration,
        "timestamp": time_stamp,
    }
    # open connection
    db = database.Database.get()

    # find table
    pins = db["pins"]

    # find user
    user = pins.find_one(user_id=spotify_user["id"])

    value = json.loads(user["value"])

    value["username"] = spotify_user

    value_json = json.dumps(value_template)

    pins.insert(dict(user_id=spotify_user["id"], value=value_json))


def edit_pin(file_name, new_message, new_duration):
    auth_manager = get_auth_manager()
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    spotify_user = spotify.current_user()

    # open connection
    db = database.Database.get()

    # find table
    pins = db["pins"]

    # find user
    user = pins.find_one(user_id=spotify_user["id"])

    value = json.loads(user["value"])

    value["username"] = spotify_user

    # loads current json and changes the old values with new values
    with open(file_name, "r+"):
        current_json = json.loads(file_name)
        current_json["pin_message"] = new_message
        current_json["pin_duration"] = new_duration

    # deletes previous json from table
    pins.remove(dict(user_id=spotify_user["id"]), value=current_json)

    # inserts new json into the table
    with open(file_name, 'w'):
        new_json = json.dumps(current_json)
        pins.insert(dict(user_id=spotify_user["id"], value=new_json))


def delete_pin(file_name):
    auth_manager = get_auth_manager()
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    spotify_user = spotify.current_user()

    # open connection
    db = database.Database.get()

    # find table
    pins = db["pins"]

    # find user
    user = pins.find_one(user_id=spotify_user["id"])

    value = json.loads(user["value"])

    value["username"] = spotify_user

    pins.remove(dict(user_id=spotify_user["id"]), value=file_name)