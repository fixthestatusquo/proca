#"${N8N_TOKEN=ZzhVxMSXs0ie4yGpB_mzPA}"
N8N_TOKEN=$(grep -v '^#' .env | grep -e "N8N_TOKEN" | sed -e 's/.*=//')

curl -X POST https://workflow.proca.app/webhook/proca-config/pull -H "Authorization: Bearer $N8N_TOKEN"
