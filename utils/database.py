import logging

import dataset
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database

from utils.config import config

log = logging.getLogger(__name__)


class Database:
    def __init__(self) -> None:
        self.host = config["database"]["host"]
        self.database = config["database"]["database"]
        self.user = config["database"]["user"]
        self.password = config["database"]["password"]

        if not all([self.host, self.database, self.user, self.password]):
            log.error("One or more database connection variables are missing, exiting...")
            raise SystemExit

        self.url = f"mysql://{self.user}:{self.password}@{self.host}/{self.database}"

    def get(self) -> dataset.Database:
        """Returns the dataset database object."""
        return dataset.connect(url=self.url)

    def setup(self) -> None:
        """Sets up the tables needed."""
        # Create the database if it doesn't already exist.
        engine = create_engine(self.url)
        if not database_exists(engine.url):
            create_database(engine.url)

        # Open a connection to the database.
        db = self.get()

        # Create user_info table and columns to store the user-related variables as a JSON object.
        if "pins" not in db:
            pins = db.create_table("pins")
            pins.create_column("user_id", db.types.text)
            pins.create_column("timestamp", db.types.bigint)
            pins.create_column("value", db.types.json)
            pins.create_column("sent", db.types.boolean, default=False)
            log.info("Created missing table: pins")

        # Commit the changes to the database and close the connection.
        db.commit()
        db.close()
