#!/usr/bin/bash
if [ -z "$1" ]; then
  echo 'name of the campaign missing'
  exit 1
fi

if [ -z "$2" ]; then
  echo "rebuilding pages from campaign \"$1\""
  grep "\"name\": \"$1\"" config/*.json -l 
  grep "\"name\": \"$1\"" config/*.json -l |  grep -oP '\d+' | xargs -L 1 nice -20 yarn build
  exit 1
fi

  echo "rebuilding pages from campaign \"$1\" and organisation \"$2\""
  grep "\"filename\": \"$1/$2" config/*.json -l 
#  grep "\"filename\": \"$1/$2" config/*.json -l |  grep -oP '\d+' | xargs -L 1 nice -20 yarn build
  exit 1

