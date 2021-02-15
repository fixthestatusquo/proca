#!/bin/bash 

# npx proca-cli watch:pages -A -J -x ./scripts/build-action-page.sh 

set -u
set -e

read -N 2048 CONFIG || true 

ID=$(echo $CONFIG | jq -r .actionpage)
CAMPAIGN_NAME=$(echo $CONFIG | jq -r .campaign.name)

if [ -n "$CAMPAIGN" -a ! "$CAMPAIGN_NAME"="$CAMPAIGN" ]; then
  echo "Not $CAMPAIGN, skipping"
  exit 0
fi

yarn pull $ID
yarn build $ID

