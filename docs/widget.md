# widget

Once initialised, the action lives in the page that embeded it. It should be noted it's _not_ an iframe, but is directly into the page, allowing a lot of customisation

everything from the widget is accessible through the global variable "proca".

_tip: all the examples given can be tried from the developer console of your browser_

//Widget, Alert, set, go, hook, React, ReactDOM

## style & design

    proca.set('layout','variant','outlined');
    proca.set('layout','variant','standard');
    proca.set('layout', 'variant','filled'); // the default

the 3 elements that can be updated: layout, campaign (main config) and data

## static text

can be configured via the dom: <span class="proca-text {key of the locale}">New text</span>

should we have a proca.set('locale')?

## init

if existing procaInit() function is called BEFORE anything else, if you want to alter anything before it's displayed

## the journey

go to the next action in the journey

    proca.go();

go to a specific action

    proca.go('share');

### customize the journey: .after()

    proca.after('petition',function(d) {console.log("the visitor "+d.firstname+"signed");})

_tip, if you want to display a message, you can use proca.Alert()_

    proca.after('petition', function(d) {proca.Alert("Thank you "+d.firstname,"success")}

if you want to prevent going to the normal next step, simply return false

## steps vs portals

steps are the various actions displayed in the main proca-widget dom (eg. Petition, followed by Share, followed by donate)

portals are extra interactions outside of the main widget, for instance display the total number of signatures elsewhere in the page. We often use it to display "static" texts, like the text of an ECI that is displayed outside of the "widget".
