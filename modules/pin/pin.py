import json
import spotipy
from flask import Blueprint, render_template, flash, redirect, url_for
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired

from utils import database
from utils.auth import get_auth_manager

pin_blueprint = Blueprint("pin_blueprint", __name__, template_folder="templates", static_folder="static")


@pin_blueprint.route("/pins", methods=['GET', 'POST'])
def createpins():
    # Fetch the OAuth2 object.
    auth_manager = get_auth_manager()

    # Initialize the Spotify object to do stuffs.
    spotify = spotipy.Spotify(auth_manager=auth_manager)

    # Get the access token value from the token dict in OAuth2 object.
    access_token = auth_manager.get_access_token()["access_token"]

    db = database.Database().get()
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    spotify_user = spotify.current_user()
    pins = db["users"]
    user = pins.find_one(user_id=spotify_user["id"])
    if not user:
        user_template = {}
        user_json = json.dumps(user_template)
        pins.insert(dict(user_id=spotify_user["id"], value=user_json))
    db.commit()
    db.close()

    form = PinForm()

    if form.validate_on_submit():
        create_pin(form.message.data, form.duration.data, form.timestamp.data)
        return redirect('/pins')

    return render_template("pin.html", legend='Create Pin', spotify=spotify, access_token=access_token, form=form)


@pin_blueprint.route("/pins/edit", methods=['GET', 'POST'])
def editpins():
    # Fetch the OAuth2 object.
    auth_manager = get_auth_manager()

    # Initialize the Spotify object to do stuffs.
    spotify = spotipy.Spotify(auth_manager=auth_manager)

    # Get the access token value from the token dict in OAuth2 object.
    access_token = auth_manager.get_access_token()["access_token"]

    form = PinForm()
    form.message.data = 'hello'
    form.timestamp.data = '1:20'
    form.duration.data = '0:30'

    if form.validate_on_submit():
        flash(f'Pin Created', 'Redirecting to home')
        return redirect('/pins')
    return render_template("edit.html", legend='Edit Pin', time=form.timestamp.data, spotify=spotify, access_token=access_token, form=form)


class PinForm(FlaskForm):
    message = StringField('Message', validators=[DataRequired()])
    timestamp = StringField('Time Stamp', validators=[DataRequired()])
    duration = StringField('Duration', validators=[DataRequired()])
    submit = SubmitField('Pin')


def create_pin(message, duration, time_stamp):
    auth_manager = get_auth_manager()
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    track = spotify.current_user_playing_track()
    track_id = track["item"]["id"]
    spotify_user = spotify.current_user()

    pin = {
        "pin_timestamp": time_stamp,
        "pin_message": message,
        "pin_duration": duration,
    }
    # open connection
    db = database.Database().get()

    # find table
    pins = db["users"]

    # find user
    user = pins.find_one(user_id=spotify_user["id"])

    # load json
    value = json.loads(user["value"])

    # check if track is already in JSON
    if track_id in value:
        # if yes, add new time stamp and place pin into it
        value[track_id][time_stamp] = {}
        value[track_id][time_stamp] = pin
    else:
        # if no, create new track, then add its timestamp and pin
        value[track_id] = {}
        value[track_id][time_stamp] = {}
        value[track_id][time_stamp] = pin

    updated_json = json.dumps(value)
    data = dict(user_id=spotify_user["id"], value=updated_json)
    pins.update(data, ["user_id"])
    db.commit()
    db.close()


def edit_pin(time_stamp, new_message, new_duration):
    auth_manager = get_auth_manager()
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    spotify_user = spotify.current_user()
    track = spotify.current_user_playing_track()
    track_id = track["item"]["id"]


    # open connection
    db = database.Database().get()

    # find table
    pins = db["users"]

    # find user
    user = pins.find_one(user_id=spotify_user["id"])

    value = json.loads(user["value"])

    # find song and timestamp, then update the pin values with what user inputted
    value[track_id][time_stamp]["pin_message"] = new_message
    value[track_id][time_stamp]["pin_duration"] = new_duration

    updated_json = json.dumps(value)
    data = dict(user_id=spotify_user["id"], value=updated_json)
    pins.update(data, ["user_id"])

    db.commit()
    db.close()


def delete_pin(time_stamp):
    auth_manager = get_auth_manager()
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    spotify_user = spotify.current_user()
    track = spotify.current_user_playing_track()
    track_id = track["item"]["id"]
    # open connection
    db = database.Database().get()

    # find table
    pins = db["users"]

    # find user
    user = pins.find_one(user_id=spotify_user["id"])

    value = json.loads(user["value"])

    # find the pin and delete it
    del value[track_id][time_stamp]

    # afterwards check if the track has pins or not
    if value[track_id]:
        # track has still has pins, update the json
        updated_json = json.dumps(value)
    else:
        # track doesnt have any pins, delete the track and update json
        del value[track_id]
        updated_json = json.dumps(value)

    data = dict(user_id=spotify_user["id"], value=updated_json)
    pins.update(data, ["user_id"])

    db.commit()
    db.close()
