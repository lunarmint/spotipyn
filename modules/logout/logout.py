import logging
import os

from flask import session, redirect, Blueprint, url_for

from utils.auth import session_cache_path

log = logging.getLogger(__name__)

logout_blueprint = Blueprint("logout_blueprint", __name__, template_folder="templates", static_folder="static")


@logout_blueprint.route("/logout")
def sign_out():
    """Sign out and ready for a new login by removing the user's cache file and clear the session."""
    try:
        os.remove(session_cache_path())
        session.clear()
    except OSError as e:
        log.error(f"Error: {e.filename} - {e.strerror}.")
    return redirect(url_for("login_blueprint.index"))
