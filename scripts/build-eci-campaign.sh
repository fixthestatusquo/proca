#!/bin/bash

set -e
set -u

camp=$1
if [ -z "$camp" ]; then
	echo "Provide campaign name as argument"
	exit 1
fi

for id in $(proca-cli pages -o act4animalseu |grep "campaign: $camp" | cut -f 1 -d ' '); do
  yarn pull $id
#	yarn build $id
    echo "building $id";
done
