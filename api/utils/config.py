import logging
import pathlib

from pyaml_env import parse_config

log = logging.getLogger(__name__)

config_file = pathlib.Path(__file__).parents[2].joinpath("config.yml")
if not config_file.is_file():
    log.error("Unable to load config.yml, exiting...")
    raise SystemExit

config = parse_config(config_file.as_posix())
