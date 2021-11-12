import json
import spotipy

from utils import database
from utils.auth import get_auth_manager

class Pin:

    def __init__(self, timestamp, message, duration):
        self.timestamp = timestamp
        self.message = message
        self.duration = duration

        self.auth_manager = get_auth_manager()
        self.spotify = spotipy.Spotify(auth_manager=self.auth_manager)
        self.spotify_user = self.spotify.current_user()
        self.track = self.spotify.track()

    def get_time_stamp(self):
        return self.timestamp

    def get_message(self):
        return self.message

    def get_duration(self):
        return self.duration

    def create_json(self):
        value_template = {
            "username": self.spotify_user,
            "song_id": self.track,
            "pin_message": self.get_message(),
            "pin_duration": self.get_duration(),
            "timestamp": self.get_time_stamp(),
        }
        return value_template

    def save(self, value_template):

        #open connection
        db = database.Database.get()

        #find table
        pins = db["pins"]

        #find user
        user = pins.find_one(user_id=self.spotify_user["id"])

        value = json.loads(user["value"])

        value["username"] = self.spotify_user

        value_json = json.dumps(value_template)

        pins.insert(dict(user_id=self.spotify_user["id"], value=value_json))



    #def editPin()

    def editMessage(self, new_message):
        self.message = new_message

    def editDuration(self, new_duration):
        self.duration = new_duration

    #delete pin()










