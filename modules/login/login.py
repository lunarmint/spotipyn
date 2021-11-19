import logging
import secrets
import string
import uuid

import spotipy
from flask import session, request, redirect, render_template, Blueprint

from utils.auth import session_cache_path
from utils.config import config

log = logging.getLogger(__name__)

login_blueprint = Blueprint("login_blueprint", __name__, template_folder="templates", static_folder="static")


@login_blueprint.route("/")
def index():
    """The entry point, serving different contents depending on the user's log in status."""

    # Assign a UUID to the new user.
    if not session.get("uuid"):
        session["uuid"] = str(uuid.uuid4())

    # Generate a random state string verifying requests to provide protection against cross-site request forgery.
    state = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(20))

    # Initialize a cache handler for the stored cache.
    cache_handler = spotipy.cache_handler.CacheFileHandler(cache_path=session_cache_path())

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

    # If no token is found, render the base.html with the authentication link.
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        auth_url = auth_manager.get_authorize_url()
        return render_template("login.html", auth_url=auth_url)

    # Get the access token value from the token dict in OAuth2 object.
    access_token = auth_manager.get_access_token()["access_token"]

    # If a token is found (logged in), render the content from index instead.
    return render_template("base.html", access_token=access_token)
