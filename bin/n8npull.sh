#!/bin/bash

set -e
set -u 
#N8N_TOKEN=$(grep -v '^#' .env | grep -e "N8N_TOKEN" | sed -e 's/.*=//')
source ./.env 
export N8N_TOKEN


curl -X POST https://workflow.proca.app/webhook/proca-config/pull -H "Authorization: Bearer $N8N_TOKEN"
