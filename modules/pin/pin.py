import json
import spotipy
from utils import database
from utils.auth import get_auth_manager


def create_pin(message, duration, time_stamp):
    auth_manager = get_auth_manager()
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    track = spotify.current_user_playing_track()
    spotify_user = spotify.current_user(),

    pin = {
        "pin_message": message,
        "pin_duration": duration,
    }
    # open connection
    db = database.Database.get()

    # find table
    pins = db["pins"]

    # find user
    user = pins.find_one(user_id=spotify_user["id"])

    # load json
    value = json.loads(user["value"])

    # check if track is already in JSON
    key = track
    if key in value:
        # if yes, add new time stamp and place pin into it
        value[key][time_stamp] = {}
        value[key][pin] = pin
    else:
        # if no, create new track, then add its timestamp and pin
        value[key] = {}
        value[key][time_stamp] = {}
        value[key][pin] = pin

    updated_json = json.dumps(value)

    pins.insert(dict(user_id=spotify_user["id"], value=updated_json))


def edit_pin(time_stamp, new_message, new_duration):
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

    # find song and timestamp, then update the pin values with what user inputted
    value[spotify.current_user_playing_track()][time_stamp]["pin_message"] = new_message
    value[spotify.current_user_playing_track()][time_stamp]["pin_duration"] = new_duration

    updated_json = json.dumps(value)

    pins.insert(dict(user_id=spotify_user["id"], value=updated_json))


def delete_pin(time_stamp):
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

    # find the pin and delete it
    del value[spotify.current_user_playing_track()][time_stamp]

    # afterwards check if the track has pins or not
    if value[spotify.current_user_playing_track()]:
        # track has still has pins, update the json
        updated_json = json.dumps(value)
    else:
        # track doesnt have any pins, delete the track and update json
        del value[spotify.current_user_playing_track()]
        updated_json = json.dumps(value)

    pins.insert(dict(user_id=spotify_user["id"], value=updated_json))