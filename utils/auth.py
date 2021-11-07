import os

import spotipy
from flask import session, redirect

from utils.config import config


def session_cache_path():
    """Get the path to the session cache folder."""
    caches_folder = "./.spotify_caches/"
    if not os.path.exists(caches_folder):
        os.makedirs(caches_folder)
    return caches_folder + session.get("uuid")


def get_auth_manager():
    """Create the auth manager."""
    cache_handler = spotipy.cache_handler.CacheFileHandler(cache_path=session_cache_path())
    auth_manager = spotipy.oauth2.SpotifyOAuth(
        client_id=config["spotify"]["client_id"],
        client_secret=config["spotify"]["client_secret"],
        redirect_uri=config["spotify"]["redirect_uri"],
        scope=config["spotify"]["scope"],
        show_dialog=True,
        cache_handler=cache_handler,
    )

    # Redirect back to root if the user's session token is invalid.
    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        return redirect("/")

    return auth_manager
