#!/usr/bin/env babel-node

import {fetch} from '../src/lib/config';

(async () => {
  const argv = process.argv.slice(2);
  const id=parseInt(process.env.actionpage || argv[0]);
  if (!id) throw ("need actionpage={id} or fetch {id}");
  try {
      const d = await fetch(parseInt(id,10));
      console.log(d);
  } catch (e) {
    console.error(e);
        // Deal with the fact the chain failed
  }
})();
