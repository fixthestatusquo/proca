### CLI commants

- Attach template to org

  `proca template:set -o ORGNAME -l LOCALE -s SUBJECT -h HTMLFILENAME`

- Attach template to a page (for thankyou emails)

`proca page:set -t ID (or PAGENAME)`

- To remove template from page

`proca page:set -T PAGENAME (or ID)`

- To activate mail service

`proca service:set -n mailjet -o ORGNAME -u 5aa1063ebe6c3953ef6e165e643eebe2 -p 3ff53d54ef035b1df2a8b0d431389618`

`proca service:email -o ORGNAME -n mailjet -f WHATEVER@proca.app`

- Supporter confirm

enable: `proca org:set –supporter-confirm ORGNAME`
disable: `proca org:set –no-supporter-confirm ORGNAME`

- DOI thankyou

enable: `proca org:set –doi ORGNAME`
disable: `proca org:set –no-doi org_name`

### Link to the guide

Consent and double opt-in [guide](https://proca.app/guide/double-opt-in/).
