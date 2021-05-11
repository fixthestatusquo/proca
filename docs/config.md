# Configuration options
The configuration options are set in a json attribute on the actionPage, and then stored into config/{actionpageid}.json

For the rest of the document, we are using 42 as the action page id, obviously replace with the real id of your widget.

## working with the configuration

pulls the configuration as stored on the proca server

    yarn pull 42

edit the configuration (file config/42.json) 

to check the configuration, run a local copy of the widget 

    yarn start 42

once you are happy with the setting, save it back to the server

    yarn push 42

and build the widget

    yarn build 42
You can edit them, run 


# configuration file main sections

## journey

Each step of the widget. they are matching a react component into src/components, for instance

- Petition -> src/components/Petition.js
- Share -> src/components/Share.js

you can (from outside of the widget), jump to the next step with 

    proca.go()

or to any step with 

    proca.go("Petition")

it can also be set from the url as a get param ?proca_go=Petition

## layout

- primaryColor: #rgb it will set the color for the button, progress bar and wherever material-ui is using the primary color ;)
- HtmlTemplate: "eci.html" it's for the "demo" page, it takes as a template the file public/{HtmlTemplate}.html

## component

This is the big chunk of the configuration options for each component.

most components are using the hook useCampaignConfig to read that config and adjust their behaviour accordingly. 


_Tip: When developing, always have a sensible default behaviour even if the specific config.component isn't set. if you add a new feature, by default, the component should work as before (backward compatibility) until you enable the new feature into the config file_

### Widget

the main behaviour
- config.component.widget.mobileVersion: boolean. if true, a floating action button is displayed instead of the normal widget, and the widget steps are displayed (after the click) on full screen
- config.component.widget?.autoStart: boolean, default true. used to not automatically display the widget. see portal Clickify below
- config.component.widget.forceWidth: number. by default, the width of the widget is the width available on the page (reactive). Can be used to force a width, for instance to embed into broken or weird html pages ;)

### Register

Register is the main form used to collect personal data and consent

- config.component.field.organisation: do we collect the organisation details (with prefill options using twitter)
- config.component.field.postcode: boolean (show/hide) or {required:boolean} 
- config.component.field.country: boolean (show/hide) or {required:boolean}
- config.component.country: 2 char iso code (default country), or boolean (disable/enable ip geolooup)
- config.component.field.phone: boolean (show/hide)


### Consent 

to collect the consent of being contacted

- config.component.consent.implicit: boolean. default false. Beside when using it as a registration form, very few GDPR valid reasons to have implicit consent. Don't use it until you really know what you're doing
- config.component.consent.privacyPolicy: **very important**: the privacy policy of the organisation embedding the widget
- config.component.consent.split: if the widget is for a partner, is the consent split (would you like to be contacted by 1) opt-in partner 2) opt-in partner+lead 3) opt-out


## Share

- config.component.share.anonymous: boolean. Are we linking the share actions to the supporter or not? are we adding the utm tracking codes to the shared url?
- config.component.share.top: boolean. Are the share button above or below image+text shared (taken from meta data)
- config.component.share.email: boolean. Enable the share by email. Brocken now (on some config)
- config.component.share.reddit: boolean: Enable share on reddit




# portal

This allows the widget to interact with other elements on the page (beside the "main" widget)

display the number of signatures into the page into the dom class="proca-counter"

    {
      "component": "Counter",
      "selector": ".proca-counter"
    }


display the title of the campaign into the dom class="eci-title"

   {
      "component": "T",
      "message": "campaign:name",
      "selector": ".eci-title"
    },


start the widget journey when clicking on a link "#proca-dialog" (or with class .proca-button)

   "Clickify"

this is used to have the widget activated on a button (the widget first step is a dialog and doesn't start automatically)



## locales

allows to overwrite any of the standard text. It can also we used with the "T" component in portals above to automatically display the text of the petition (used to put the official text of the ECI for instance)




## grep config.component

you can probably safely ignore that

components/Widget.js:58:  if (config.component.widget?.mobileVersion === false) isMobile = false;
components/Widget.js:131:      if (config.component.widget?.autoStart === false) return setCurrent(null);
components/Widget.js:220:    if (config.component.widget?.autoStart !== false) {
components/Widget.js:237:        width={isMobile || config.component.widget?.forceWidth ? 0 : null}
components/Iframe.js:16:  let url = config.component.iframe.url;
components/Iframe.js:24:  if (config.component.iframe.hash)
components/Iframe.js:25:    url = url + "#" + config.component.iframe.hash;
components/Iframe.js:39:          config.component.iframe.successMessage &&
components/Iframe.js:40:          event.data === config.component.iframe.successMessage
components/Iframe.js:46:  }, [done, config.component.iframe.successMessage, iframeOrigin]);
components/Iframe.js:50:      width={config.component.iframe.width}
components/Iframe.js:51:      height={config.component.iframe.height}
components/Register.js:93:    if (config.component.consent?.implicit) data.privacy = "opt-in";
components/Register.js:98:        : config.component?.register?.actionType || "register",
components/Register.js:124:    if (!config.component.share?.anonymous) {
components/Register.js:192:  const ConsentBlock = config.component.consent?.implicit
components/Register.js:209:            {config.component?.register?.field.organisation && (
components/Register.js:242:            {config.component?.register?.field?.postcode !== false && (
components/Register.js:250:                    config.component?.register?.field?.postcode?.required
components/Register.js:255:            {config.component?.register?.field?.country !== false && (
components/Register.js:260:            {config.component?.register?.field?.phone === true && (
components/Register.js:265:            {config.component?.register?.field?.comment !== false && (
components/Register.js:300:                  t(config.component.register?.button || "register")}
components/Register.js:302:              {config.component.register?.next && (
components/Ep.js:70:            const committee = config.component.Ep.filter.committee;
components/Ep.js:88:    if (config.component?.twitter?.listUrl)
components/Ep.js:89:      fetchData(config.component.twitter.listUrl);
components/Ep.js:91:  }, [config.component, config, setAllProfiles]);
components/Consent.js:65:    config.component?.consent?.privacyPolicy ||
components/Consent.js:68:    config.component?.country === false
components/Consent.js:72:    config.component?.consent?.intro === false
components/Consent.js:79:  const confirmOptOut = !(config.component.consent?.confirm === false); // by default we ask for confirmation
components/Consent.js:102:          {!config.component?.consent?.split && (
components/Consent.js:112:          {config.component?.consent?.split && (
components/Email.js:52:          if (!config.component.email?.filter?.includes("country"))
components/Email.js:59:    if (config.component?.email?.listUrl) {
components/Email.js:60:      fetchData(config.component.email.listUrl);
components/Email.js:63:        typeof config.component.email.to === "string"
components/Email.js:64:          ? config.component.email.to?.split(",")
components/Email.js:74:  }, [config.component, config.hook, setAllProfiles]);
components/Email.js:112:    const bcc = config.component.email?.bcc;
components/Email.js:130:    if (config.component.email?.cc === true) {
components/Email.js:135:      config.component.email?.to &&
components/Email.js:136:      typeof config.component.email.to === "string"
components/Email.js:138:      to = config.component.email.to;
components/Email.js:181:      {config.component.email.progress && (
components/Email.js:184:      {config.component.email?.filter?.includes("country") && (
components/Email.js:185:        <Country form={form} list={config.component?.twitter?.countries} />
components/Email.js:187:      {config.component.email?.showTo !== false && (
components/Country.js:86:    country: config.data.country || config.component.country,
components/EmailAction.js:74:      onClick={config.component?.email?.split === true ? mail : null}
components/EmailAction.js:81:      {config.component?.email?.split === true && (
components/Clickify.js:3:  //  config.component.widget?.mobileVersion;
components/campax/Initiative.js:71:    config.component.initiative.prefixActionPage +
components/italy/Register.js:106:      config.test ? "test" : config.component?.register?.actionType || "sign",
components/italy/Register.js:266:                sitekey={config.component.register.hcaptcha}
components/italy/Register.js:295:                  t(config.component.register?.button || "register")}
components/italy/Consent.js:85:                    url: config.component.consent.privacyPolicy,
components/italy/Consent.js:86:                    urlRegister: config.component.consent.content,
components/eci/Details.js:13:  const eci = config.component.eci;
components/eci/Support.js:110:      +config.component.eci.actionpage,
components/eci/Support.js:112:      { captcha: token, apiUrl: config.component.eci.apiUrl }
components/eci/Support.js:249:                  geocountries={config.component.eci.geocountries}
components/eci/Support.js:265:                  sitekey={config.component.eci.hcaptcha}
components/eci/Stepper.js:22:    config.component.eci.starts === "email"
components/eci/Country.js:61:    country: config.data.country || config.component.country,
components/ImplicitConsent.js:45:    config.component?.consent?.privacyPolicy ||
components/ImplicitConsent.js:48:    config.component?.country === false
components/Twitter.js:49:          if (!config.component.twitter?.filter.includes("country"))
components/Twitter.js:56:    if (config.component?.twitter?.listUrl)
components/Twitter.js:57:      fetchData(config.component.twitter.listUrl);
components/Twitter.js:58:  }, [config.component, config.hook, setAllProfiles]);
components/Twitter.js:107:      {config.component.twitter?.filter?.includes("country") && (
components/Twitter.js:108:        <Country form={form} list={config.component?.twitter?.countries} />
components/Share.js:119:        {config.component.share?.top && <Actions {...props} />}
components/Share.js:130:          {!config.component.share?.top && <Actions {...props} />}
components/Share.js:132:        {config.component.share?.next && (
components/Share.js:173:        {!!config.component?.share?.email && (
components/Share.js:182:        {!!config.component?.share?.reddit && (
components/Share.js:196:      if (config.component.share?.anonymous === true) return; // do not record the share if anonymous
components/donate/Sepa.js:53:      config.test ? "test" : config.component?.register?.actionType || "donate",
components/donate/Sepa.js:136:            {config.component?.donate?.field?.phone === true && (
components/ProgressCounter.js:76:  const goal = nextStep(count, config.component.counter?.steps);
components/ProgressCounter.js:77:  const separator = config.component.counter?.separator;
components/Mep.js:46:    if (config.component?.twitter?.listUrl) 
components/Mep.js:47:      fetchData(config.component.twitter.listUrl);
components/Mep.js:48:  }, [config.component, config.hook, setAllProfiles]);
hooks/usePaypal.js:102:    if (!config.component.donation?.paypal?.clientId) return;
hooks/usePaypal.js:105:      (config.test ? "sb" : config.component.donation.paypal.clientId || "sb");
hooks/useCount.js:38:  const apiUrl = config.component?.useCount?.apiUrl || null;
components/donate/Amount.js:122:  const average = config.component.donation?.amount?.oneoff?.average;
components/donate/Amount.js:128:    : config.component.donation?.subTitle;
components/donate/Amount.js:129:  const image = config.component.donation?.image;
components/donate/Amount.js:144:    if (config.component.donation.external?.url) {
components/donate/Amount.js:163:        config.component.donation.external.url + amount + params,
components/donate/Amount.js:213:              {config.component.donation?.monthly !== false && (
components/donate/Amount.js:245:        {!config.component.donation.external && (
