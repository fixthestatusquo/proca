#!/bin/bash

[ -z $1 ] && echo "ap id missing" && exit 1

source .env

if [ -n "$N8N_TOKEN" ]; then

	curl https://workflow.proca.app/webhook/widget/build?id=$1 -H "Authorization: Bearer $N8N_TOKEN"

elif [ -n "$WIDGETBUILDER" ]; then
  curl -v --data "{\"actionPageId\": $1}" -H 'Content-Type: application/json' -H 'X-User: WidgetBuilder' $WIDGETBUILDER/hooks/build
else
  echo configure N8N_TOKEN or WIDGETBUILDER env vars
fi
