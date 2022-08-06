there are various cli utils under the bin folder to make it easier to configure a campaign

most of them have a --help param and a --dry-run param to give you more information/let your try safely

all the local configuration files are stored into config
# config page and campaign

yarn pull or bin/pull : fetch a widget (and associated campaign) from the server 
yarn push or bin/push : push a widget (not the associated campaign) to the server. it triggers a rebuild if you use the central hosting (our)
yarn pullCampaign or bin/pullCampaign: fetch a campaign config
yarn pushCampaign or bin/pushCampaign: push a campaign config

bin/set.js : change the config of a widget (--push --pull to automatically sync with the server)
bin/setCampaign.js : change the config of a campaign (--push --pull to automatically sync with the server)

bin/buildCampaign.sh: build the widgets of a campaign (or partner)

# targets

twitter sync: under separate repo

# mail template

bin/mailTemplate.js convert a mjml file into a localised html one, extract the i18n strings into src/locales/en/server.js

# snowflake
under separate repo
