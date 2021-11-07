# Spotipyn
A Spotify-based web application that allows users to place annotations, or 'pins', into songs at specified timestamps. These pins are able to be customized with a message and a duration.

## Prerequisites
1. [Install MariaDB](https://mariadb.org/) (v10.6.4) to create a local database source in your IDE. If you're using PyCharm, see the instructions [here](https://www.jetbrains.com/help/pycharm/mariadb.html).

## Getting started
**Step 1:** Clone the repository from terminal `git clone https://github.com/lunarmint/spotipyn.git`. If you use GitHub Desktop, clone the repository with it will achieve similar result.

**Step 2:** Create a copy of `.env.example` file, rename it to `.env` and fill in all the required variables as specified in the file.

**Step 3:** Create a copy of `config.default.yml` file, rename it to `config.yml` and fill in all the required variables as specified in the file.

**Step 4:** From the terminal, run `pip install -r requirements.txt`.

**Step 5:** The entry point to interpret the application will be `spotipyn.py`.

## Contributing
Any contributions are more than welcomed. Please follow these steps to get your work merged in:

1. Clone the repository from terminal `git clone https://github.com/lunarmint/spotipyn.git`.
2. Create a new branch `git checkout -b branch_name` for your work.
3. Make changes in the code.
4. Open a Pull Request with a comprehensive list of changes.
  
## Built on
This project relies predominantly on:
* [dataset](https://github.com/pudo/dataset)
* [Flask](https://flask.palletsprojects.com/en/2.0.x/)
* [MariaDB](https://mariadb.org/)
* [pyaml-env](https://github.com/mkaranasou/pyaml_env)
* [Python](https://www.python.org/) (3.9 or higher)
* [Spotipy](https://spotipy.readthedocs.io/en/stable/)
