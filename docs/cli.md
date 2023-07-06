there are various cli utils under the bin folder to make it easier to configure a campaign

most of them have a --help param and a --dry-run param to give you more information/let your try safely

all the local configuration files are stored into config

# config page and campaign

yarn pull or yarn widget --pull : fetch a widget (and associated campaign) from the server
yarn push or yarn widget --push : push a widget (not the associated campaign) to the server. it triggers a rebuild if you use the central hosting (our)
yarn campaign --pull or yarn pullCampaign: fetch a campaign config
yarn campaign --push or yarn pushCampaign: push a campaign config

bin/set.js : change the config of a widget (--push --pull to automatically sync with the server)
bin/setCampaign.js : change the config of a campaign (--push --pull to automatically sync with the server)

bin/buildCampaign.sh: build the widgets of a campaign (or partner)

# targets

put the list of targets into src/target/source/campaign (usually synced from airtable)
yarn target --push: push the targets' list to the server. one option might be useful --salutation: that builds a salutation field based on the language/country and gender of the target
yarn target --pull: pull the targets' list from the server (ie get the internal id)
yarn target --publish: build a public version of the list of targets

# mail template

yarn template convert a mjml file into a localised html one

# snowflake

under separate repo
