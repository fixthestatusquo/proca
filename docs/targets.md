# Actions with targets

As opposed to petitions, some actions will have each supporter choosing a specific target, for instance their member of the parliament or their nearest petrol station.

This document describes more specifically a MTT (mail to target) action, but the concepts should be mostly similar for other type of actions (phone to target, twitter storm...) with multiple targets and some kind of rules on how to associate a supporter to a specific target.

## Defining the targets

The total list of targets are defined at the campaign level. Each widget might display only a subset of that list, but there is no widget that will have a target that isn't defined in the campaign.

the list of target is a json into config/campaign/{name}/targets.json, the format is (@xav to complete once you get it working):

each campaign 
  campaign(name:$name) {
    targets {
      id name area fields externalId
      ... on PrivateTarget {
        emails { email }
      }
    }


you can fetch it with bin/pullTarget.js {campaign name}
and push it with bin/pushTarget.js {campaign name}

@marcin, can you complete/confirm:

- any target without id will be created and an id created (?MK unless there is a matching externalId already?)
- any target with an id will be updated
- multiple targets can have the same area
- area can be empty
- area can contain any value (string or number), it's just a field that can be used by the widget for filtering and for stats.
- multiple targets can have the same email (?MK)
- fields can contain whatever needed by the widget for display and/or extra filtering (eg a picture, twitter screenname...). all these fields are considered public/visible online
- email is private information and never seen by the supporter/widget. the widget records the targets using the id
- all the targets that were on the server and removed from the file are removed on pushTarget (?MK)


## createAction

extra param (MK? need to find the graphql)

## default structure, working out of the box

- fields {
screename:"@xxx",
picture:"https://url"
firstname: "xxx"
lastname: "yyy"
description: "bla/title"
country? -> in area or duplicate?
}
