# events on proca

proca generates custom events that can be listened to from the page embedding the widget

All the events are sent on the dom node "#proca" (the script dom), but they bubble up so you can handle them on the window object.

to make it easier to debug and find the event triggered, you can add in your page:

    window.addEventListener("proca", function(e){console.log(e.detail.message,e.detail);});

it will list all the events triggered. This is what is done on the preview page of your widget, so if you go there and open the developer console, you will see them.

## Google Tag Manager

We have strict privacy protecting practices and We **do not** add any external script. However, if your website is using GTA already, we are integrating our widget with it and send the event described below. To make it easier for you to process them, we prefix the event with "proca_", and put "proca widget" as the category or "proca widget test" (if in test mode)

- EventCategory: "proca widget"
- event: "proca_init"
- EventCategory: "proca widget"
- event: "petition_init" (or email_init, depending on the event)
- EventCategory: "proca widget"
- event: "share_init"


## events

each event.detail has two parameters :

- message, the name action, of instance that the user finished a step and it going to the next one
- value: the (optional) details of the action, for instance the amount if the event is a contribution

### init

Called once when the widget is displayed. you can customise the widget from there, for instance change the primary color and the general style (variant):

    window.addEventListener("proca", e => {
      if (e.detail.message === "init") {
        proca.set("layout", "variant", "outlined");
        proca.set("layout","primaryColor","#f90");
      }
      if (e.detail.message === "register:complete") {
        // do something after petition signature (or mtt)
      }
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
if (e.message !== "input*error") return;
console.log(e.message.type /*"captcha" _/, e.message.message: /_"captcha: challenge expired"\_/);
});

for privacy/security reasons, we avoid returning the erroneous input, just the error

### register

We do not recommend to completely skip our share step, it is highly optimised and increases the number of signatures by up to 10%, nearly all of them will be new supporters for you

    window.addEventListener("proca", e => {
      if (e.detail.message === "register:complete") {
        // do something after petition signature (or mtt)
        window.location.href = "https://proca.app"; // your thank you page with donation
      }
    });

### share

    window.addEventListener("proca", e => {
      if (e.detail.message === "share") {

/_ event.detail.value: {
uuid,
payload: {medium:"**twitter/facebook...**"},
tracking: {location: **url**}
}
_/

      }
    });

### donate

### twitter

### share_click, share_close
