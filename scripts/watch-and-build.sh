#!/bin/zsh

export NODE_ENV=development

zmodload zsh/zutil

while inotifywait -e modify -r src/ config/; do
  yarn build wemove;
  cp d/birds/minimumbasicseeds/index.js ~/wemove/speakout/public/javascripts/proca/index.js;
  gunzip -c d/birds/minimumbasicseeds/index.js.map.gz > ~/wemove/speakout/public/javascripts/proca/index.js.map;
  cp d/birds/minimumbasicseeds/index.js.map.gz ~/wemove/speakout/public/javascripts/proca/index.js.map.gz;
done
