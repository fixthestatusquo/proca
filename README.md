# Proca *Progressive Campaigning* 

You want to engage your members and ask them to take an online action? Well, you won't be the first organisation, and you will soon realise that they aren't any decent looking petition tool that are easy to install and configure.

And this is what this tool solves.

## Guiding principles and design
- *Focussed*: this tool should do as little as possible. It doesn't have to be managing the content/layout of your campaign. You have already a prefered CMS for that, or can spin a wordpress one in no time. We provide action/petition widgets that you can embed into your site, we don't want to be yet another site you need to manage
- *Build relationship*: We don't believe a petition is only a step in your campaign. Collecting their information so you can contact them later for more actions and campaigns
- *Privacy*: We will always ask the people taking action to consent to their contact details being shared with your org. We will never use these contacts without their/and your consent.
- *Sharing is caring*: We have seen how supporters can use social media to convince others to join. We see the sharing step as a key component to this tool
- *Integrated*: with your CRM/mailing list. If your supporter consented it, it should be as simple as possible to have their contact detail into your mailing plateform. CSV download is not simple, timeconsuming and errorprone.
- *Support coalitions*: A successful campaign will have multiple partners. We make it easy to aggregate the signature counts, we make it easy to have multiple widgets for each partner (with different consent)


## Embeded in your existing website

Introducing a new tool is often a source of frustration for the users (new login, new interface to learn, new workflow, new bugs) and extra work for the IT team (adapt the layout). 
There are as well the issue of introducing a new domain/subdomain (weak SEO, potential confusion for your supporters).

Our solution? This petition tool is as transparent as possible and embed the action into one (or several) of your existing pages).

## Full encryption mode
If the campaigner organisation provides an encryption key (based on NaCl, probably the best elliptic curve encryption solution), we store the signatures and actions *encrypted*. We will not be able to read them anymore. Even if the bad guys compromise the security of our server, they will not be able to read any personal data either, because the campaign organisation (having the key) is the only one that can

This simplify GDPR and other privacy compliance: we do not store any personal data, only encrypted blobs of data that we can't read.

## Privacy
We are fully GDPR compliant. As part of a mandatory element of the signature form, we do ask the signatory to consent to be contacted, and record that information.

## Performance

Benchmarked at > 1'000'000 signatures per hour on a 16 core

## Technology
Front and back are clearly separated. the backend is a bunch of APIs clearly documented (so it's easier to build a different front end or switch the back end)
graphql

front-end: react (next.js or gatsby to generate multiple widgets?)
Back-end: elixir

Please note that this project is released with a [Contributor Code of Conduct](code_of_conduct.md). By participating in this project you agree to abide by its terms.

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](code_of_conduct.md) 



