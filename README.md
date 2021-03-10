# Proca _Progressive Campaigning_

-   Provide a state of the art campaiging tool
-   Integrate with the campaign website so no new CMS to learn
-   Work with coalition and GDPR

You want to engage your members and ask them to take an online action? Well,
you won't be the first organisation, and you will soon realise that they aren't
any decent looking petition tool that are easy to install and configure.

And this is what this tool solves.

## Guiding principles and design

-   _Focused_: this tool should do as little as possible. It doesn't have to be
    managing the content/layout of your campaign. You have already a prefered CMS
    for that, or can spin a wordpress one in no time. We provide action/petition
    widgets that you can embed into your site, we don't want to be yet another
    site you need to manage
-   _Build relationship_: We don't believe a petition is only a step in your
    campaign. Collecting their information so you can contact them later for more
    actions and campaigns
-   _Privacy_: We will always ask the people taking action to consent to their
    contact details being shared with your org. We will never use these contacts
    without their/and your consent.
-   _Sharing is caring_: We have seen how supporters can use social media to
    convince others to join. We see the sharing step as a key component to this
    tool
-   _Integrated_: with your CRM/mailing list. If your supporter consented it, it
    should be as simple as possible to have their contact detail into your
    mailing plateform. CSV download is not simple, timeconsuming and errorprone.
-   _Support coalitions_: A successful campaign will have multiple partners. We
    make it easy to aggregate the signature counts, we make it easy to have
    multiple widgets for each partner (with different consent)

## Embeded in your existing website

Introducing a new tool is often a source of frustration for the users (new
login, new interface to learn, new workflow, new bugs) and extra work for the
IT team (adapt the layout). There are as well the issue of introducing a new
domain/subdomain (weak SEO, potential confusion for your supporters).

Our solution? This petition tool is as transparent as possible and embed the
action into one (or several) of your existing pages).

## Full encryption mode

If the campaigner organisation provides an encryption key (based on NaCl,
probably the best elliptic curve encryption solution), we store the signatures
and actions _encrypted_. We will not be able to read them anymore. Even if the
bad guys compromise the security of our server, they will not be able to read
any personal data either, because the campaign organisation (having the key) is
the only one that can

This simplify GDPR and other privacy compliance: we do not store any personal
data, only encrypted blobs of data that we can't read.

## Privacy

We are fully GDPR compliant. As part of a mandatory element of the signature
form, we do ask the signatory to consent to be contacted, and record that
information.

## Performance

Benchmarked at > 1'000'000 signatures per hour on a 16 cores.

# Quick Start

This repository is a React based app - which generates a static JS file to
connect to a specific instance of the [Proca
backend](https://github.com/fixthestatusquo/proca-backend/).

These instructions are for generating a production ready widget based on a
proca-backend hosted at a public URL.

If you want to use donations, you'll also need a [Proca
donate](https://github.com/fixthestatusquo/proca-donate/) server running.

1. Pre-requisites

    - Node >= 12
    - yarnpkg (npm install -g yarnpkg)
    - A login for a running instance of the [proca-backend](https://github.com/fixthestatusquo/proca-backend/).

    For donations:

    - A running instance of the [Proca donate](https://github.com/fixthestatusquo/proca-donate/)
      server.

1. Install React and all the project dependencies:

    $ yarn install

1. Configure your environment. You can use .env.example as an example, here are
   the settings you'll need:

    # TODO

    # - remove everything we can set in a config file

    # - prefix all our ENV settings with PROCA\_

    # The details of your proca-backend and account

    REACT_APP_API_URL={URL of your proca-backend instance}
    AUTH_USER=youremail@example.org
    AUTH_PASSWORD=secret123

    # If you want donations, the URL of your proca-donate server

    # REACT_APP_DONATION_URL=https://proca-donate.herokuapp.com

    # Build env settings

    INLINE_RUNTIME_CHUNK=false
    REACT_APP_NAME=$npm_package_name

1. TODO: simplify the rest of this

    - yarn pull {action id listed on the /dash/campaigns page of your proca-backend server}

    You'll see a file name in the output - you can edit to change the options.

    TODO: Document the options.

    ```
    /home/aaron/fixthestatusquo/proca/config/1.json
    {
      actionpage: 1,
      organisation: 'Birds and Bees',
      lang: 'fr',
      filename: 'birdsandbees/pollen',
      lead: { name: 'Birds and Bees', title: 'Birds and Bees' },
      campaign: { title: "Let's pollinate" },
      journey: [ 'Petition', 'Share' ],
      layout: {},
      component: {},
       portal: [],
      locales: {},
      template: false
    }
    ```

-   yarn start {action id}

Will run a local server with an example of the widget and
instructions on using it. The command will output the local
URL of the development server.

-   yarn build {action id}

Will generate a static build (a js file) of the widget under d/{action id of the action?}

You can host and use this JS file in the real world.

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](code_of_conduct.md)

Please note that this project is released with a [Contributor Code of Conduct](code_of_conduct.md). By participating in this project you agree to abide by its terms.
