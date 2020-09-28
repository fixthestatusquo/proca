// for historical reasons, replaced by src/tmp.config/{actionPageid}.load.js
import Loader from "../components/Loader";
import Petition from "Conditional_Petition";
//import Button from "Conditional_FAB";
import Button from "../components/FAB";
import Share from "Conditional_Share";
import Twitter from "Conditional_Twitter";
import Ep from "Conditional_Ep";
//import Dialog from "Conditional_Dialog";
import Dialog from "../components/Dialog";
import Clickify from "Conditional_Clickify";
import Html from "Conditional_Html";
import DonateAmount from "Conditional_DonateAmount";
import DonateStripe from "Conditional_DonateStripe";

// bespoke
import RegisterCH from "Conditional_bespoke/Register-CH";
import Download from "Conditional_bespoke/Download";

const allSteps = {
  loader: Loader,
  petition: Petition,
  button: Button,
  share: Share,
  twitter: Twitter,
  Ep: Ep,
  clickify: Clickify,
  html: Html,
  dialog: Dialog,
  DonateAmount: DonateAmount,
  DonateStripe: DonateStripe,
  "register.CH": RegisterCH,
  download: Download
};
if (!Dialog instanceof Function) {
  allSteps.dialog = Dialog.Open;
  allSteps.close = Dialog.Close;
}

let steps = {};

process.widget.journey.forEach(d => {
  if (d instanceof Array) {
    // substep case
    d.forEach(e => (steps[e] = allSteps[e]));
    return;
  }

  steps[d] = allSteps[d];
});


export {steps, allSteps};
