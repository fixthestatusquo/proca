# Email templates

## 1. Attach the template to the org

`proca template:set -o ORGNAME -l LANGUAGE -s SUBJECT -h PATHTOTEMPLATE`
`name TEMPLATENAME (thankyou, confirm)`

- ### 1.1 Attach thankyou template to the page (only for thankyou emails)
  &nbsp;&nbsp;&nbsp;&nbsp; `proca page:set -t TEMPLATENAME ORGNAME`

## 2 Set mail backend (optional, defaults to system)

`proca service:set -n mailjet -o ORGNAME -u SECRETNUMBER  -p ANOTHERSECRETNUMBER`

- ### 2.a. Set from and reply to to whatever@proca.app

  &nbsp;&nbsp;&nbsp;&nbsp; `proca service:email -o ORGNAME -n mailjet -f whatever@proca.app`

- ### 2.b. Set 'reply to' to the client's mail address
  &nbsp;&nbsp;&nbsp;&nbsp; `proca service:email -n system -o ORGNAME`
  &nbsp;&nbsp;&nbsp;&nbsp; `proca service:email -o ORGNAME  -n mailjet -f MAILADDRESS`

# Org settings

### DOI

`proca org:set –doi ORGNAME`

### DOI and thankyou

_Templates with conditional blocks_
`proca org:set –no-doi ORGNAME`

### Action confirm

`proca org:set –supporter-confirm ORGNAME`

### Action and DOI confirm

_Template with conditional blocks and buttons with links {{doiLink}} for confirm and {{doiLink}}?doi=1 for confirm+subscribe_

# Widget snack bar

### DOI

`confirm.component.consent.email.confirmOptIn: true`

### Action confirm

(works for action+DOI case)
`confirm.component.consent.email.confirmAction: true`

# Default email templates

### thankyou

Each supporter gets a ‘thank you’ note.

### doi (double opt-in)

Supporters who choose opt-in on the form get an email to confirm opt-in.

### confirm

All users get an email to confirm an action (signature). Action is not counted until the supporter clicks on the email URL.

### thankyou_doi

Each supporter gets an email

- if the supporter chooses opt-in on the form, gets doi+thankyou
- if the supporter chooses opt-out on the form, gets thankyou

### doi_confirm

Each supporter gets an email

- if the supporter chooses opt-in on the form, gets doi+confirm, to confirm both opt-in and action by clicking on the (one) button
- if the supporter chooses opt-out on the form, gets an email with a ‘confirm action’ button

## Link to the guide

Consent and double opt-in [guide](https://proca.app/guide/double-opt-in/).
