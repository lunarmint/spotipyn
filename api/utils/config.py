import logging
import pathlib

import confuse

log = logging.getLogger(__name__)

config_file = pathlib.Path(__file__).parents[2].joinpath("config.yml")
if not config_file.is_file():
    log.error("Unable to load config.yml, exiting...")
    raise SystemExit

config = confuse.Configuration(appname="bot")
config.set_file(config_file.as_posix())
