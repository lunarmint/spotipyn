import json
import spotipy
from utils.auth import get_auth_manager


# TODO: Create the sample template here when the pin functionality is added.
auth_manager = get_auth_manager()
spotify = spotipy.Spotify(auth_manager=auth_manager)
spotify_user = spotify.current_user()

user_template = {
    "username": spotify_user,
}


async def create_user():
    """Initialize the JSON object for user values if it doesn't exist yet."""
    # Dump the string into a JSON object and return it.
    user_json = json.dumps(user_template)
    return user_json
