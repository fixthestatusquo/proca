# events on proca

proca generates custom events that can be listened to from the page embedding the widget

All the events are sent on the dom node "#proca" (the script dom), but they bubble up so you can handle them on the window object.

to make it easier to debug and find the event triggered, you can add in your page:

    window.addEventListener("proca", function(e){console.log(e.type,e.detail);});

it will list all the events triggered

## events

each event has two parameters :

- message, the name action, of instance that the user finished a step and it going to the next one
- value: the (optional) details of the action, for instance the amount if the event is a contribution

### init

Called once when the widget is displayed. you can customise the widget from there, for instance change the primary color and the general style (variant):

    window.addEventListener("proca", e => {
      if (e.message !== "init") return;
      proca.set("layout", "variant", "outlined");
      proca.set("layout","primaryColor","#f90");
    });

### complete

end of the journey.

    window.addEventListener("proca", function(e){
      if (e.message !== "complete") return;
      alert("THAT'S ALL, FOLKS");
      window.location.href = "https://proca.app"; // your thank you page
    });

_note: If you do not handle that event and change the page, the widget is looping back to the first step._

### input_error

When there is an issue with an entry from the user

window.addEventListener("proca", function (e) {
if (e.message !== "input_error") return;
console.log(e.message.type /_"captcha" _/, e.message.message: /_"captcha: challenge expired"_/);
});

for privacy/security reasons, we avoid returning the erroneous input, just the error

### register

### share

### donate

### twitter

### eci_support

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
