
# Actions with targets

As opposed to petitions, some actions will have each supporter choosing a specific target, for instance their member of the parliament or their nearest petrol station.

This document describes more specifically a MTT (mail to target) action, but the concepts should be mostly similar for other type of actions (phone to target, twitter storm...) with multiple targets and some kind of rules on how to associate a supporter to a specific target.

## Defining the targets

The total list of targets are defined at the campaign level. Each widget might display only a subset of that list, but there is no widget that will have a target that isn't defined in the campaign.

the list of target is a json into config/campaign/{name}/targets.json, the format is (@xav to complete once you get it working):

In Proca API, targets is a property on Campaign. It will always be a list of targets, if you have a private access to campaign, you will get PrivateTarget, if you only have public access to campaign, you will get PublicTarget.
PrivateTarget has emails property (list of {email, emailStatus}), which is not available in PublicTarget.

```
  campaign(name:$name) { // or campaign(id: $id)
    targets {
      id name area fields externalId
      ... on PrivateTarget {
        emails { email emailStatus }
      }
    }
```

emailStatus can be one of:

- `none` - default status, free to send
- `bounce` - cannot send
- `blocked`- cannot send
- `spam`- cannot send
- `unsub`- email was unsubscribed

you can fetch it with bin/pullTarget.js {campaign name}
and push it with bin/pushTarget.js {campaign name}

@marcin, can you complete/confirm:

- Targets have id (auto-generated uuid) and optional external id. You can either store the generated ids of targets and updated them later by id, or provide the external id and use that (you will not have to store proca generated id this way)
- XXX fix! In WIP version externalId is mandatory - but we can make it optional

- so the upsertTargets works as follows:

  1. is external id given? and is there such target in the campaign? -> update it
  2. is id given? and is there such target in the campaign? -> update it
  3. create a new target, generate id as uuid for it

- multiple targets can have the same area - and the area will be used to match supporters area, for stats (reminder: supporter.area is calculated from contact data depending on contact_schema of the campaign. For now it's a country, but for Swiss initiative it's the canton. For other contact schemas it's possible to have constituencies here, or whatever makes sense for your campaign)
- area can be empty - in which case all the supporters of that campaign will be matched to that target
- area can contain a string, and it should match the area of supporter in same campaign (for example country).
- multiple targets can have the same email - yes. (XXX although atm if one such target bounces, only their email will be set to bounce.. perhaps it should updated all email_statuses also in other campaigns)
- fields can contain whatever needed by the widget for display and/or extra filtering (eg a picture, twitter screenname...). all these fields are considered public/visible online. Fields need to be a flat map, with string keys, and values being one of: string, number, list of strings, list of numbers.
- email is private information and never seen by the supporter/widget. the widget records the targets using the id. (XXX considering if we should allow selecting by external id, but perhaps external id should be used for sync only. Should external id be public or not?)
- all the targets that were on the server and removed from the file are not removed from the server, because they might have messages created for them. If you want to disable target, you can set their emails to unsub / empty list []. Perhaps the api should return `mailable` flag so widget can exclude such targets? OR if we really want to remove targets along with mtt for them (the result would be like they never existed) we could add overwrite: true flag to upsertTargets.

## createAction

addActionX's `action` parameter has new optional field:

```
mtt {
 subject: "mandatory",
 body: "mandatory",
 targets: [id1, id2, id3]  # at least one needed
}

```

## default structure, working out of the box

- target fields default set:

```
{
  screename:"@xxx",
  picture:"https://url"
  first_name: "xxx"
  last_name: "yyy"
  description: "bla/title"
  country? -> in area or duplicate?
}
```
# workflow

the source of truth is on an airtable (in general)

the first step it to pull the airtable list into the proca-config into config/target/source/{name_campaign}.json, we are using n8n for that (check n8n tagged at mtt, each source has slightly different format

- change on airtable
- use n8n to fetch the api and push it to proca-config

once it's on the target/source, you need to push it to proca server

- node bin/pushTargets.js {campaign} 
there are various options (run with --help). one that you might need is to generate a salutation based on the language and language (assuming they are on airtable)

now you need to pull the targets from the server, mostly so you can have the internal proca-server reference for each target

- node bin/pullTargets.js {campaign} 

there are various options (run with --help). it creates or update the list under config/target/server/{campaign}.json

now you need to generate the list of targets as it will be used by the widget (tip: it can be a subset of the list of targets on the server, eg you can generate one list without the far right and one with them, and have different lists for different widgets.

- node bin/buildTarget.js {campaign}

there are various options (run with --help). it creates or update the list under config/target/public/{campaign}.json

at any point in the process, you can check with git if the lists are looking how you want them

the last step is to publish that list on the https server so it can be fetched by the widget. That process is git based

- cd config
- git commit * -m "update list of targets for campaigns..."
- git push
- bash bin/n8npull.sh




