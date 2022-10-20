# Email templates

## 1. Attach the template to the org
 `proca template:set -o ORGNAME -l LANGUAGE -s SUBJECT -h PATHTOTEMPLATE`
  `name TEMPLATENAME (thankyou, confirm)`

- ### 1.1 Attach thankyou template to the page (only for thankyou emails)
&nbsp;&nbsp;&nbsp;&nbsp;  `proca page:set -t TEMPLATENAME ORGNAME`

## 2 Set mail backend (optional, defaults to system)
`proca service:set -n mailjet -o ORGNAME -u SECRETNUMBER  -p ANOTHERSECRETNUMBER`

- ### 2.a. Set from and reply to to  whatever@proca.app
&nbsp;&nbsp;&nbsp;&nbsp;  `proca service:email -o ORGNAME -n mailjet -f whatever@proca.app`

- ### 2.b. Set 'reply to' to the client's mail address
&nbsp;&nbsp;&nbsp;&nbsp;  `proca service:email -n system -o ORGNAME`
&nbsp;&nbsp;&nbsp;&nbsp;  `proca service:email -o ORGNAME  -n mailjet -f MAILADDRESS`


# Org settings

### DOI
`proca org:set –doi ORGNAME`

### DOI and thankyou
*Templates with conditional blocks*
`proca org:set –no-doi ORGNAME`

### Action confirm
`proca org:set –supporter-confirm ORGNAME`

### Action and DOI confirm

*Template with conditional blocks and buttons with links {{doiLink}} for confirm and {{doiLink}}?doi=1 for confirm+subscribe*


# Widget snack bar

### DOI
`confirm.component.consent.email.confirmOptIn: true`

### Action confirm
(works for action+DOI case)
`confirm.component.consent.email.confirmAction: true`

### Link to the guide
Consent and double opt-in [guide](https://proca.app/guide/double-opt-in/).
