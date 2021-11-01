FROM python:3.9.7-slim-buster
LABEL maintainer="https://github.com/lunarmint/spotipyn"

# Prevents Python from generating .pyc files in the container.
ENV PYTHONDONTWRITEBYTECODE=1
# Turns off buffering for easier container logging.
ENV PYTHONUNBUFFERED=1
# Force UTF8 encoding for funky characters.
ENV PYTHONIOENCODING=utf8

# Install MySQL and nginx
RUN apt-get update -y && \
    apt-get install --no-install-recommends -y build-essential libmariadb-dev-compat libmariadb-dev python-mysqldb git

# Update pip and install the requirements.
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Place where the app lives in the container.
WORKDIR /app
COPY . /app

# During debugging, this entry point will be overridden. For more information, refer to https://aka.ms/vscode-docker-python-debug
CMD ["python", "spotipyn.py"]
