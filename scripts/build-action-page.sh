#!/bin/bash 
set -u
set -e

read -N 1024 CONFIG || true 

NAME=$(echo $CONFIG | jq -r .filename)

FILENAME=src/tmp.config/${NAME}.json
mkdir -p $(dirname $FILENAME)
echo $CONFIG > src/tmp.config/${NAME}.json

echo "Will build $NAME"

actionpage="${NAME}" yarn build

