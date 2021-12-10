[ -z $1 ] && echo "ap id missing" && exit 1
curl https://workflow.proca.app/webhook/widget/build?id=$1
