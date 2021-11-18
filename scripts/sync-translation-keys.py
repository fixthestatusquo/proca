#!python

import glob
import json
import copy

# load en/common.json
def clean(cleaned, to_clean):
    for k in list(to_clean.keys()):
        if k not in cleaned:
            del to_clean[k]
        elif type(cleaned[k]) != type(to_clean[k]):
            to_clean[k] = copy.deepcopy(cleaned[k])
        elif isinstance(cleaned[k], dict):
            clean(cleaned[k], to_clean[k])


base = json.load(open("src/locales/en/common.json"))

files = [f.strip() for f in glob.glob("src/locales/*/common.json")]
for f in files:
    if f.endswith("en/common.json"):
        continue
    print(f"Modifying {f}")
    lang = json.load(open(f))
    clean(base, lang)
    json.dump(lang, open(f, "w"), ensure_ascii=False, indent=2)
