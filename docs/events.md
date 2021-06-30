# events on proca

proca generates custom events that can be listened to from the page embedding the widget

All the events are sent on the dom node "#proca" (the script dom). 

- journey (blur)
- step (load/blur)
- ? action specific actions ? (sign/share/donate/tweet/mail? submit? done? complete?)
- ? contact 


Should we create "pseudo dom" elements (for each step/action to listen to?)

## events

### complete 
end of the journey

    event.detail: {
       journey
    }

TODO: add a config so the data isn't sent

### go
displaying a new step with the detail on the event being:

    event.detail: {
       step: #stepname // Petition, Share, Donate, Twitter...
       journey: // the full journey of the widget
    }

### share_click, share_close

   event.detail: {
       uuid, 
       payload: {key:"medium", value:"twitter/facebook..."},
       tracking: utm in the url
   }

### register (used by petition,openletter...)

### donate


## how to use

    function procaReady ()  {
        document.getElementById("proca").addEventListener("load", function(e){
          console.log(e.detail); // 
          alert("stuff happened");
       }, false);
    };



