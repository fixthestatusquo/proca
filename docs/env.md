

you can access several servers (eg prod and staging). to create a new environement

cp .env.sample to .env.staging

set up the config folder, api url, user and password

prefix with PROCA_ENV=staging all the commands

eg:

PROCA_ENV=staging yarn pull 42
PROCA_ENV yarn start 42


