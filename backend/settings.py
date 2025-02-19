from os import getenv
from os import path
from logzero import logger
from dotenv import load_dotenv
from peewee_async import Manager
from peewee_asyncext import PooledPostgresqlExtDatabase

# IMPORT ENVIRONMENT VARIABLES
env_path = getenv('ENV_PATH')
load_dotenv(dotenv_path=env_path, override=True)
is_production = getenv('STG') == 'production'
logger.warning('APPLICATION-STAGE: %s', '={}='.format(env_path))

JWT_SECRET = getenv('JWT_SECRET')

# SETUP ASYNC ORM
database = PooledPostgresqlExtDatabase(
    getenv('DB_NAME'),
    register_hstore=False,
    max_connections=8,
    user=getenv('DB_USER'),
    password=getenv('DB_PASSWORD'),
    host=getenv('DB_HOST'),
    port=getenv('DB_PORT'),
)

objects = Manager(database)

# APPLICATION BACKEND SETTINGS
base_path = path.dirname(__file__)
settings = {
    'autoreload': not is_production,
    'cookie_secret': getenv('SECRET_COOKIE'),
    'debug': not is_production,
    'login_url': '/login',
    'objects': objects,
    'static_path': base_path + '/static',
    'stg': getenv('STG'),
    'template_path': base_path + '/template',
}
