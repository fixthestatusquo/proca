#!/bin/zsh

yarn start wemove &;

while inotifywait -e modify -r src/ config/; do
  # kill -- -`ps -ao pid,args | grep start | grep -v grep | perl -lne 'print $1 if m/\s*(\d+) /'`;
  yarn start wemove &;
done
