[ -z $1 ] && echo "ap id missing" && exit 1

N8N_TOKEN=$(grep -v '^#' .env | grep -e "N8N_TOKEN" | sed -e 's/.*=//')

curl https://workflow.proca.app/webhook/widget/build?id=$1 -H "Authorization: Bearer $N8N_TOKEN"
