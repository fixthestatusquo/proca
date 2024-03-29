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

the common way to change it is either through our dashboard or directly in the configuration file of the widget or the campaign.

should we have a proca.set('locale')?

## change the configuration dynamically

(or at any time). the workflow is to listen to one of the event generated by the widget and use it to change the configuration. It should be noted that when the widget sends the event, it hasn't necessarily been displayed, so if you plan to modify the dom, you need to wait a tiny duration.

     proca.set ("component", newvalue)

new value is the config.component object you want. or

     proca.set ("component", "key", value)

window.addEventListener("proca", (e) => {
if (e.detail.message === "init") {
setTimeout(() => {
proca.set("component", {
share: {
url: "https://example.org",
open: false, // open the share in the same window instead of a new one
next: true, // add a next button on the share step
},
});
proca.go("Share");
}, 10);
} else {
console.log("loading...");
setTimeout(gotoShare, 10);
gotoShare();
}
if (e.detail.message === "share:init") {
setTimeout(() => {
const button = document.getElementById("proca-share-" + media);
button.click();
}, 10);
}
});

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
