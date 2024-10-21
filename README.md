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

Front and back are clearly separated. the backend is a bunch of APIs clearly documented (so it's easier to build a different front end or switch the back end)

- front-end: react, react-hook-form and material-ui
- [Back-end](../proca-server): elixir
- api: graphql

# Setup and 3 min intro

- `git clone` this repository
- `npm install`
- `cp .env.example .env` and put your login + pwd
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

One of the most common contribution we receive is help on the translations. We are using [weblate](https://hosted.weblate.org/projects/proca) and you are encouraged to participate, either to improve an existing language or request a new one.

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
