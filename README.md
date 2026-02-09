# Proca _Progressive Campaigning_

Proca is an open-source campaign toolkit designed to empower activists and organisations in their digital advocacy efforts. It provides a flexible and customisable platform for creating and managing online petitions, email campaigns, and other forms of digital engagement, enabling users to effectively mobilise supporters and drive social change.

One of Proca's standout features is its robust support for coalition campaigns, allowing multiple organisations to collaborate seamlessly on shared initiatives. This coalition functionality enables partners to pool resources, amplify their collective voice, and reach a broader audience whilst maintaining individual branding and supporter relationships. By facilitating data sharing and joint campaign management, Proca helps coalitions to maximise their impact, streamline operations, and present a united front on critical issues, all whilst ensuring compliance with data protection regulations.


- provide a state of the art campaiging tool
- integrate with the campaign website, so no new CMS to learn
- work with coalitions and GDPR
- privacy first, every personal data of your supporter is encrypted with your organisation key

You want to engage your members and ask them to take an online action? Well, you won't be the first organisation, and you will soon realise that they aren't any decent looking petition tool that are easy to install and configure.

And this is what this tool solves.

Alternatively, [we](https://fixthestatusquo.org) are providing this [Campaign tool as a Service](https://proca.app) and are hosting and maintaining it for you if you prefer. It's definitely cheaper and easier if you have a one-off campaign, and cost effective if you have a more specific need or want us to provide some custom development.

## Guiding principles and design

- _Focussed_: this tool should do as little as possible. It doesn't have to be managing the content/layout of your campaign. You have already a prefered CMS for that, or can spin a wordpress one in no time. We provide action/petition widgets that you can embed into your site, we don't want to be yet another site you need to manage
- _Build relationship_: We don't believe a petition is only a step in your campaign. Collecting your supporters information so you can contact them later for report back, quickers, more actions and campaigns
- _Privacy_: We will always ask the people taking action to consent to their contact details being shared with your org. We will never use these contacts without their/and your consent.
- _Sharing is caring_: We have seen how supporters can use social media to convince others to join. We see the designed the share step as a key component to this tool
- _Integrated_: with your CRM/mailing list. If your supporter consented it, it should be as simple as possible to have their contact detail into your mailing plateform. CSV download is not simple, timeconsuming and errorprone.
- _Support coalitions_: A successful campaign will have multiple partners. We make it easy to aggregate the signature counts, we make it easy to have multiple widgets for each partner (with different consent going to different CRMs)

## Embeded in your existing website

Introducing a new tool is often a source of frustration for the users (new login, new interface to learn, new workflow, new bugs) and extra work for the IT team (adapt the layout).
There are as well the issue of introducing a new domain/subdomain (weak SEO, potential confusion for your supporters).

Our solution? This petition tool is as transparent as possible and embed the action into one (or several) of your existing pages).

With a bit of javascript or even just html, you can [control and adjust the text or layout](./docs/config.md) of your widget.

The widget can also [send you events](./docs/events.md) to let you know what your supporters have done, and allow you to update the journey, display extra information or whaterver you want to do ;)

## Full encryption mode

If the campaigner organisation provides an encryption key (based on NaCl, probably the best elliptic curve encryption solution), we store the signatures and actions _encrypted_. We will not be able to read them anymore. Even if the bad guys compromise the security of our server, they will not be able to read any personal data either, because the campaign organisation (having the key) is the only one that can

This simplify GDPR and other privacy compliance: we do not store any personal data, only encrypted blobs of data that we can't read.

## Privacy

We are fully GDPR compliant. As part of a mandatory element of the signature form, we do ask the signatory to consent to be contacted, and record that information.

## Performance

Benchmarked at > 1'000'000 signatures per hour on a 16 cores.

## Technology

Front and back are clearly separated. the backend is headless, ie it only provides a [graphQL API](https://doc.proca.app/welcome) (so it's easier to build a different front-end for a specific org or campaign).

- front-end: react, react-hook-form and material-ui
- [Back-end](../proca-server): elixir
- [api](https://doc.proca.app/welcome): graphql

# Setup and 3 min intro

- `git clone` this repository
- `npm install`
- `cp .env.example .env` and put your login + pwd (either your account on our server or your install)
- npx proca plugins link
- npm run pull folowed by the action page id as seen in the backend. For instance

  `npx proca widget pull -i 42`

  This will create the configuration file for the widget with id `42`. it does also pull the configuration for the campaign into config/campaign/{shortname}.json

- edit `config/42.json` or the config/campaign to adjust the steps, configure the components, change the color, whatever)
- `npx proca widget serve -i 42` runs a local server with the widget
- `npx proca widget build -i 42` generates the widget under d/{actionpage.NAME of the widget}
- `npx proca widget push -i 42` save the local config (under config) to the server

You can find more information in this [config documentation](./docs/config.md)

# Documentation and Translation

One of the most common contribution we receive is help on the translations. We are using [weblate](https://hosted.weblate.org/projects/proca) and you are encouraged to participate, either to improve any of our 46 existing languages or request a new one.

We are usually following the [material-ui guidelines](https://material.io/design/communication/writing.html#principles):

- Be concise
- Use the present tense to describe product behavior
- Use simple, direct language that makes content easy to understand.
- Avoid using punctuation in places where it isn't necessary
- Use common words that are clearly and easily understandable across all reading levels
- Be inclusive

We strive to use an inclusive language in the code, translations, documentation and issue tracker. By contributing to this project, you agree to listen when someone raise an issue that doesn't affect you directly, reflect on it and refrain to argue endlessly. Atalassian [has a good list](https://atlassian.design/content/inclusive-writing) that isn't meant to be exclusive but a starting point.

# Community and code of conduct

Our vision is for radical change in society in a socialist, feminist, antiracist and sustainable direction. Our role within that is to make online campaigning easier and more effective and we are building a flexible and easy to use action tool which has all the useful features to help progressive campaigners change the world. We hope to help grow a diverse online community of progressive campaigners, technologists and activists who will support each other, share tricks and stories and grow together.

Before starting to change something, we recommend you to contact us (create an issue on github is fine), who knows, what you need might already be almost there, we are just missing some documentation and explanation.

Please note that this project is released with a [Contributor Covenant](code_of_conduct.md). By participating in this project you agree to abide by its terms.

# All the commands 

<!-- commands -->
* [`proca campaign markdown`](#proca-campaign-markdown)
* [`proca campaign pull`](#proca-campaign-pull)
* [`proca campaign push`](#proca-campaign-push)
* [`proca campaign read`](#proca-campaign-read)
* [`proca campaign translate`](#proca-campaign-translate)
* [`proca campaign widget pull`](#proca-campaign-widget-pull)
* [`proca locale campaign read`](#proca-locale-campaign-read)
* [`proca locale pull`](#proca-locale-pull)
* [`proca locale push`](#proca-locale-push)
* [`proca locale status`](#proca-locale-status)
* [`proca locale widget read`](#proca-locale-widget-read)
* [`proca target publish`](#proca-target-publish)
* [`proca template push`](#proca-template-push)
* [`proca widget build`](#proca-widget-build)
* [`proca widget pull`](#proca-widget-pull)
* [`proca widget push`](#proca-widget-push)
* [`proca widget read`](#proca-widget-read)
* [`proca widget serve`](#proca-widget-serve)
* [`proca widget view`](#proca-widget-view)

## `proca campaign markdown`

Export a campaign's locale file

```
USAGE
  $ proca campaign markdown [--json | --csv | --markdown] [--env <value>] [--simplify] [-i <value> | -n
    <the_short_name> | -x <value>] [--lang <value>] [--namespace <value>]

FLAGS
  -i, --id=<value>
  -n, --name=<the_short_name>  name (technical short name, also called slug)
  -x, --dxid=<value>           dxid
      --env=<value>            [default: default] allow to switch between configurations (server or users)
      --lang=<value>           [default: en]
      --namespace=<value>      Limit translation to a specific namespace (e.g., common, letter, campaign)

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  Export a campaign's locale file
```

## `proca campaign pull`

pull the campaign from the server to the config file

```
USAGE
  $ proca campaign pull [--json | --csv | --markdown] [--env <value>] [--simplify] [-i <value> | -n <value> | -x
    <value>] [--git]

FLAGS
  -i, --id=<value>
  -n, --name=<value>
  -x, --dxid=<value>  dxid
      --env=<value>   [default: default] allow to switch between configurations (server or users)
      --[no-]git      commit the changes to git

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  pull the campaign from the server to the config file
```

## `proca campaign push`

push the campaign from the config file to the server

```
USAGE
  $ proca campaign push [--json | --csv | --markdown] [--env <value>] [--simplify] [-i <value> | -n <value> | -x
    <value>] [--git]

FLAGS
  -i, --id=<value>
  -n, --name=<value>
  -x, --dxid=<value>  dxid
      --env=<value>   [default: default] allow to switch between configurations (server or users)
      --[no-]git      commit the changes to git

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  push the campaign from the config file to the server
```

## `proca campaign read`

Reads a campaign configuration file

```
USAGE
  $ proca campaign read [--env <value>] [--json | --csv | --markdown] [--simplify] [-i <value> | -n <campaign> | -x
    <value>] [--config] [--locale <value>]

FLAGS
  -i, --id=<value>
  -n, --name=<campaign>  name (technical short name, also called slug)
  -x, --dxid=<value>     dxid
      --[no-]config      display the config
      --env=<value>      [default: default] allow to switch between configurations (server or users)
      --locale=<value>   display a locale

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  Reads a campaign configuration file

ALIASES
  $ proca campaign read
```

## `proca campaign translate`

Translate a campaign's locale file from one language to another.

```
USAGE
  $ proca campaign translate -c <value> --to <value> [--json | --csv | --markdown] [--env <value>] [--simplify] [--from
    <value>] [--force] [--namespace <value>] [--dry-run]

FLAGS
  -c, --campaign=<value>   (required) Name of the campaign to translate.
      --dry-run            Perform a dry run without saving changes
      --env=<value>        [default: default] allow to switch between configurations (server or users)
      --force              Force overwrite of existing translations.
      --from=<value>       [default: en] Source language for translation.
      --namespace=<value>  Limit translation to a specific namespace (e.g., widget, form)
      --to=<value>         (required) Target language for translation.

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  Translate a campaign's locale file from one language to another.
```

## `proca campaign widget pull`

pull all the widgets of a campaign

```
USAGE
  $ proca campaign widget pull [--json | --csv | --markdown] [--env <value>] [--simplify] [-i <value> | -n
    <the_short_name> | -x <value>]

FLAGS
  -i, --id=<value>
  -n, --name=<the_short_name>  name (technical short name, also called slug)
  -x, --dxid=<value>           dxid
      --env=<value>            [default: default] allow to switch between configurations (server or users)

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  pull all the widgets of a campaign

EXAMPLES
  $ proca-cli campaign widget pull climate-action
```

## `proca locale campaign read`

Reads a campaign configuration file

```
USAGE
  $ proca locale campaign read [--env <value>] [--json | --csv | --markdown] [--simplify] [-i <value> | -n <campaign> | -x
    <value>] [--config] [--locale <value>]

FLAGS
  -i, --id=<value>
  -n, --name=<campaign>  name (technical short name, also called slug)
  -x, --dxid=<value>     dxid
      --[no-]config      display the config
      --env=<value>      [default: default] allow to switch between configurations (server or users)
      --locale=<value>   display a locale

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  Reads a campaign configuration file

ALIASES
  $ proca campaign read
```

## `proca locale pull`

git pull of the config folder from the remote main

```
USAGE
  $ proca locale pull

DESCRIPTION
  git pull of the config folder from the remote main
```

## `proca locale push`

git push of the config folder to the remote main

```
USAGE
  $ proca locale push

DESCRIPTION
  git push of the config folder to the remote main
```

## `proca locale status`

git status of the config folder

```
USAGE
  $ proca locale status

DESCRIPTION
  git status of the config folder
```

## `proca locale widget read`

Reads a widget configuration file

```
USAGE
  $ proca locale widget read [--env <value>] [--json | --csv | --markdown] [--simplify] [-i <value> | -n <widget> | -x
    <value>] [--config]

FLAGS
  -i, --id=<value>
  -n, --name=<widget>  name (technical short name, also called slug)
  -x, --dxid=<value>   dxid
      --[no-]config    display the config
      --env=<value>    [default: default] allow to switch between configurations (server or users)

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  Reads a widget configuration file

ALIASES
  $ proca widget read
```

## `proca target publish`

publish the targets for the campaign to be accessible from the widget

```
USAGE
  $ proca target publish [--json | --csv | --markdown] [--env <value>] [--simplify] [-i <value> | -n
    <the_short_name> | -x <value>] [--campaign] [--git]

FLAGS
  -i, --id=<value>
  -n, --name=<the_short_name>  name (technical short name, also called slug)
  -x, --dxid=<value>           dxid
  --[no-]campaign
      --env=<value>            [default: default] allow to switch between configurations (server or users)
      --[no-]git               commit the changes to git

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  publish the targets for the campaign to be accessible from the widget
```

## `proca template push`

push to the server a template

```
USAGE
  $ proca template push [--json | --csv | --markdown] [--env <value>] [--simplify] [-n <the_short_name>] [-i
    <value>] [-x <value>] [-c <value>] [--git]

FLAGS
  -c, --campaign=<value>       push all the widgets of that campaign [WIP]
  -i, --id=<value>
  -n, --name=<the_short_name>  name (technical short name, also called slug)
  -x, --dxid=<value>           dxid
      --env=<value>            [default: default] allow to switch between configurations (server or users)
      --[no-]git               commit the changes to git

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  push to the server a template

EXAMPLES
  $ proca template push -o <organisation>
```

## `proca widget build`

build the widget

```
USAGE
  $ proca widget build -i <value> [--json | --csv | --markdown] [--env <value>] [--simplify] [-n <the_short_name>]
    [-x <value>]

FLAGS
  -i, --id=<value>             (required)
  -n, --name=<the_short_name>  name (technical short name, also called slug)
  -x, --dxid=<value>           dxid
      --env=<value>            [default: default] allow to switch between configurations (server or users)

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  build the widget
```

## `proca widget pull`

pull the widget (and campaign) configuration from the server

```
USAGE
  $ proca widget pull [--json | --csv | --markdown] [--env <value>] [--simplify] [-i <value> | -n <widget> | -x
    <value>] [--campaign] [--git]

FLAGS
  -i, --id=<value>
  -n, --name=<widget>  name (technical short name, also called slug)
  -x, --dxid=<value>   dxid
      --[no-]campaign  pull the campaign as well
      --env=<value>    [default: default] allow to switch between configurations (server or users)
      --[no-]git       commit the changes to git

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  pull the widget (and campaign) configuration from the server
```

## `proca widget push`

push to the server the local configuration of the widget

```
USAGE
  $ proca widget push [--json | --csv | --markdown] [--env <value>] [--simplify] [-n <the_short_name>] [-i
    <value>] [-x <value>] [-c <value>] [--git]

FLAGS
  -c, --campaign=<value>       push all the widgets of that campaign [WIP]
  -i, --id=<value>
  -n, --name=<the_short_name>  name (technical short name, also called slug)
  -x, --dxid=<value>           dxid
      --env=<value>            [default: default] allow to switch between configurations (server or users)
      --[no-]git               commit the changes to git

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  push to the server the local configuration of the widget

EXAMPLES
  $ proca widget push -o <organisation>
```

## `proca widget read`

Reads a widget configuration file

```
USAGE
  $ proca widget read [--env <value>] [--json | --csv | --markdown] [--simplify] [-i <value> | -n <widget> | -x
    <value>] [--config]

FLAGS
  -i, --id=<value>
  -n, --name=<widget>  name (technical short name, also called slug)
  -x, --dxid=<value>   dxid
      --[no-]config    display the config
      --env=<value>    [default: default] allow to switch between configurations (server or users)

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  Reads a widget configuration file

ALIASES
  $ proca widget read
```

## `proca widget serve`

serve the local version of the widget

```
USAGE
  $ proca widget serve [--json | --csv | --markdown] [--env <value>] [--simplify] [-i <value> | -n
    <the_short_name> | -x <value>]

FLAGS
  -i, --id=<value>
  -n, --name=<the_short_name>  name (technical short name, also called slug)
  -x, --dxid=<value>           dxid
      --env=<value>            [default: default] allow to switch between configurations (server or users)

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  serve the local version of the widget
```

## `proca widget view`

view the widget

```
USAGE
  $ proca widget view [--json | --csv | --markdown] [--env <value>] [--simplify] [-i <value> | -n
    <the_short_name> | -x <value>] [--preview]

FLAGS
  -i, --id=<value>
  -n, --name=<the_short_name>  name (technical short name, also called slug)
  -x, --dxid=<value>           dxid
      --env=<value>            [default: default] allow to switch between configurations (server or users)
      --preview                view the preview widget instead of the live version

OUTPUT FLAGS
  --csv            Format output as csv
  --json           Format output as json
  --markdown       Format output as markdown table
  --[no-]simplify  flatten and filter to output only the most important attributes, mostly relevant for json

DESCRIPTION
  view the widget
```
<!-- commandsstop -->
