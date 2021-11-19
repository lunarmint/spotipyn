import spotipy
from flask import Blueprint, render_template

from utils.auth import get_auth_manager

playlist_blueprint = Blueprint(
    "playlist_blueprint",
    __name__,
    template_folder="templates",
    static_folder="static",
    url_prefix="/playlist",
)


@playlist_blueprint.route("/")
def playlist():
    # Fetch the OAuth2 object.
    auth_manager = get_auth_manager()

    # Get the access token value from the token dict in OAuth2 object.
    access_token = auth_manager.get_access_token()["access_token"]

    return render_template("playlist.html", access_token=access_token)
