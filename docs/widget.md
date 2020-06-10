# widget

Once initialised, the action lives in the page that embeded it. It should be noted it's *not* an iframe, but is directly into the page, allowing a lot of customisation

everything from the widget is accessible through the global variable "proca". 

_tip: all the examples given can be tried from the developer console of your browser_

## style & design

    proca.set('variant','outlined');
    proca.set('variant','standard');
    proca.set('variant','filled'); // the default

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
