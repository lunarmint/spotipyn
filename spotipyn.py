import logging
import os
import secrets
import string
import uuid

import spotipy
from flask import Flask, session, request, redirect, render_template
from flask_session import Session

# __init__ is the log module. Do not remove this.
# noinspection PyUnresolvedReferences
import __init__
from utils.config import config

# Initialize the event logger.
log = logging.getLogger(__name__)

# Initialize the Flask app.
app = Flask(__name__)
app.config["SECRET_KEY"] = config["spotify"]["secret_key"]
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_FILE_DIR"] = "./.flask_session/"
Session(app)

# Create the cache folder if it's not already existed yet.
caches_folder = "./.spotify_caches/"
if not os.path.exists(caches_folder):
    os.makedirs(caches_folder)


# Get the path to the cache file with matching UUID.
def session_cache_path():
    return caches_folder + session.get("uuid")


@app.route("/")
def index():
    """The entry point, serving different contents depending on the user's log in status."""

    # Assign a UUID to the new user.
    if not session.get("uuid"):
        session["uuid"] = str(uuid.uuid4())

    # Generate a random state string verifying requests to provide protection against cross-site request forgery.
    state = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(20))

    # Initialize a cache handler for the stored cache.
    cache_handler = spotipy.cache_handler.CacheFileHandler(cache_path=session_cache_path())

    # Authenticate the requests using Authorization Code Flow.
    auth_manager = spotipy.oauth2.SpotifyOAuth(
        client_id=config["spotify"]["client_id"],
        client_secret=config["spotify"]["client_secret"],
        redirect_uri=config["spotify"]["redirect_uri"],
        state=state,
        scope=config["spotify"]["scope"],
        show_dialog=True,
        cache_handler=cache_handler,
    )

    # Redirect the user back to root again after authentication.
    if request.args.get("code"):
        auth_manager.get_access_token(request.args.get("code"), as_dict=False)
        return redirect("/")

    # If no token is found, render the login html with the authentication link.
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        auth_url = auth_manager.get_authorize_url()
        return render_template("login.html", auth_url=auth_url)

    # If a token is found (logged in), render the content from index instead.
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    return render_template("index.html", spotify=spotify)


@app.route("/sign_out")
def sign_out():
    """Sign out and ready for a new login by removing the user's cache file and clear the session."""
    try:
        os.remove(session_cache_path())
        session.clear()
    except OSError as e:
        print(f"Error: {e.filename} - {e.strerror}.")
    return redirect("/")


if __name__ == "__main__":
    app.run(threaded=True, host=config["host"], port=config["port"])
