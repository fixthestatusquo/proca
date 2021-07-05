# events on proca

proca generates custom events that can be listened to from the page embedding the widget

All the events are sent on the dom node "#proca" (the script dom), but they bubble up so you can handle them on the window object. 

to make it easier to debug and find the event triggered, you can add in your page:

    window.addEventListener("proca:debug", function(e){console.log(e.type,e.detail);});

it will list all the events triggered 



## events

each event has a "name:action" format. the "detail" attribute on the event contains specific extra information relevant to the event.

### proca:init

Called once when the widget is displayed. you can customise the widget from there, for instance change the primary color and the general style (variant):

      window.addEventListener("proca:init", d => {
        proca.set("layout", "variant", "outlined");
        proca.set("layout","primaryColor","#f90");
      });

    window.addEventListener("eci_support:init", function(e){console.log(e.type,e.detail);});
    window.addEventListener("eci:complete", function(e){console.log(e.type,e.detail);});
    window.addEventListener("share:click", function(e){console.log(e.type,e.detail);});
    window.addEventListener("share:close", function(e){console.log(e.type,e.detail);});

### proca:complete 

end of the journey. 

    window.addEventListener("proca:complete", function(e){
      alert("THAT'S ALL, FOLKS");
      window.location.href = "https://proca.app"; // your thank you page
    });

_note: If you do not handle that event and change the page, the widget is looping back to the first step._


### register:init
### share:init
### donate:init
### twitter:init
### eci_support:init

Every time the widget displays a new step, a event "name of the step" _(in lowercase)_ + ":init" is trigered
you might use it to display/hide specific instructions in the page

### eci:complete

The eci step is completed. event.detail

    {
      "uuid": "rng7yRvFNBhcGHHxsD_dvViV0uzkGhMi4FJwU6rUeAM",
      "test": false,
      "country": "BE"
    }

The uuid can be displayed (that's the unique id, the supporter can use it to request to remove their support)
the country isn't considered personal information and can be displayed (eg "you joined the 1984 people that signed from your country...")

### share_click, share_close

   event.detail: {
       uuid, 
       payload: {key:"medium", value:"twitter/facebook..."},
       tracking: utm in the url
   }

