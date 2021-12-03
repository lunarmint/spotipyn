# __init__ is the log module. Do not remove this.
# noinspection PyUnresolvedReferences
import __init__
from modules import create_app
from utils import database
from utils.config import config

spotipyn = create_app()

if __name__ == "__main__":
    database.Database().setup()
    spotipyn.run(threaded=True, host=config["host"], port=config["port"])
