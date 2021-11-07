import json

# TODO: Create the sample template here when the pin functionality is added.
user_template = {}


async def create_user():
    """Initialize the JSON object for user values if it doesn't exist yet."""
    # Dump the string into a JSON object and return it.
    user_json = json.dumps(user_template)
    return user_json
