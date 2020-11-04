#!/bin/bash 
set -u
set -e

read -N 1024 CONFIG || true 

ID=$(echo $CONFIG | jq -r .actionpage)

yarn pull $ID
actionpage="${ID}" yarn build

