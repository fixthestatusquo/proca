# how to use

     $yarn build 
     
This generates the default widget that is reachable under [widget.proca.foundation/d/proca.foundation](https://widget.proca.foundation/d/proca.foundation)

     $widget={domain-name-action-page.tld} yarn build 

This generates a customised widget for a specific action page reachable under api.proca.foundation/d/{domain-name-action-page.tld}

## how to configure a new widget/actionPage

_TODO_:fetch automatically from our api

put a new {domain-name-action-page.tld}.yaml file into the config folder (use _default as the example, it is what is used if you do not set a widget env param before runing yarn build) 

    lang=EN
    mode=form
    actionpage=2
    filename=proca.foundation
    organisation=Proca Foundation


# How does it work?

painfully. create-react-app is a great way to start, and a pain to configure. Someone, help me move that to another packer

1) it takes the config variables from config/xxx.yaml ($widget=xxx yarn build) and put them into process.widget.variables
2) these variables are used a compile time. They can be used either to hardcode a string, conditionally import a language or feature or whatever customisation you want
3) if uses the variable process.widget.filename as the destination of the widget (into /build/d/filename/index.js)
4) the widget wraps everything into the only global variable injected: proca
you can add a form using proca.form() for instance


check config-overrides.js for the details
cra-rewired

export as a library
  config.output.libraryTarget= 'umd';
  config.output.library = ["proca"];

# Still to do

fetch the config from our api
have a webhook or something to generate the widget on demand
have a "wizard" mode when the domain name isn't configured/actionPage missing


