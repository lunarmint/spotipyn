import logging
import os

from pyaml_env import parse_config

log = logging.getLogger(__name__)

os.chdir("C:\\Users\\josej\\Downloads\\Fall (2021)\\CSC 380\\spotipy\\spotipyn")

if not os.path.isfile(os.path.join(os.getcwd(), "config.yml")):
    log.error("Unable to load config.yml, exiting...")
    raise SystemExit

config = parse_config(os.path.join(os.getcwd(), "config.yml"))
