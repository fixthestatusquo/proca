#!/bin/sh
FORMAT=$(echo -e "\033[1;33m%w%f\033[0m written, re-building")
"$@"
while inotifywait -qr src/components config/ src/locales -e close_write --format "$FORMAT" .
do
    "$@"
done
