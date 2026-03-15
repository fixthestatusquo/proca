

npx quicktype -o docs/schema/campaign.json config/campaign/*.json -l schema
npx quicktype -o docs/schema/widget.json config/*.json -l schema
npx quicktype -o docs/schema/org.json config/org/*.json -l schema

