# configure the texts of the widget

## the various texts in the widget can be configured at multiple places:

- **[on weblate](https://hosted.weblate.org/projects/proca/)**: this is to fix or improve a generic translation. It will apply every widget created in the future (after we validate the translation).

- **in the campaign configuration**: this is when all widgets of the campaigns will have the same change.
- **in the widget configuration**: we do not recommend using this feature, either modify the text at the campaign level or from the webpage containing the widget
- **in the page containing the widget**: most of the common texts can be changed from your website

## Configuration from the page embedding the widget

This is the easiest to change: add a paragraph in your page that contains the new text you want. You have then to add two classes to that paragraph, _"proca-text"_ to indicate the widget that it's a special text to process (it will hide it so your visitors don't see it) and the name of the text to change, for instance _"sign-now"_ to change the "Sign now" text on the button

the complete example: if you want to have "Take action" as the text of the button, add anywhere in your page:

    <p class="proca-text sign-now">Take action!</p>

Each CMS has different ways of setting classes on paragraphs, you can either use the interface provided by your CMS or add is as a raw html block

### generic texts

- sign-now
- register
- share_title
- share_intro
- consent_intro
- consent_opt-in
- consent_opt-in
- twitter_actionText

**warning: you can modify the text around the GDPR consent, but you should get it approved by your lawyer or privacy person. Changing it might be a big legal risk**

### campaign texts

These might be better changed in the campaign config

- share
- share-twitter
- share-whatsapp
- share-telegram
- share-linkedin
- share-subject
- share-body
- dialog-title

### pre-fill the form

- firstname
- lastname
- email
- phone
- postcode
- country
- comment
