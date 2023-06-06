import { formatNumber } from "@components/ProgressCounter";

const goal = 1,
  count = 1,
  separator = " ";
const t = (d) => {
  process.exit(
    "this is a placeholder file to define texts for yarn i18n, not meant to run",
    d
  );
};
// for consent
t(
  "consent.confirmAction",
  "We have sent a confirmation link by email to the following address:\n {{email}}\nPlease retrieve the email right now and click on the link it contains. Only then will your action count!\nYour confirmation is crucial for the political weight of the action. This guarantees that there really is a person behind every participation. We are waiting... \n"
);
t(
  "consent.confirmOptIn",
  "Don’t forget to check your mailbox (including your  spam folder!) and confirm your email subscription"
);

t("dateFormat");
t("required");
t("email.salutation", "Dear sir/madam");
t("email.salutation_male", "Dear {target name}");
t("email.salutation_female", "Dear {target_name}");
t(
  "closed",
  "##thanks to {{total}} supporters!\n\nWe have closed this action, but our work does not end here, so please **leave your email to stay informed about the next steps**"
);
t(
  "consent.processing",
  "Your personal information will be kept private and held securely. By submitting information you are agreeing to the use of data and cookies in accordance with our <1>privacy policy</1>"
);
t(
  "consent.processing-nocookie",
  "Your personal information will be kept private and held securely. By submitting information you are agreeing to the use of data in accordance with our <1>privacy policy</1>"
);

// for actions
t("action.register", { defaultValue: "Register" });
t("action.eci", { defaultValue: "Sign the ECI" });
t("action.stayInformed", { defaultValue: "Stay informed" });
t("action.join", { defaultValue: "Join" });
t("action.sign", { defaultValue: "Sign" });
t("action.share", { defaultValue: "Share" });
t("action.donate", { defaultValue: "Donate" });
t("action.email", { defaultValue: "Send an Email" });
t("action.twitter", { defaultValue: "Tweet" });
t("action.takeAction", { defaultValue: "Take action" });

t("salutations.m", "Dear {{name}}");
t("salutations.f", "Dear {{name}}");
t("salutations.other", "Dear {{name}}");
t("consent.required", "Your consent is needed to participate");

// for donations
//
t("donation.frequency.ask.oneoff", { defaultValue: "Donate" });
t("donation.frequency.ask.weekly", { defaultValue: "Make it monthly?" });
t("donation.frequency.ask.monthly", {
  defaultValue: "Make this a weekly donation?",
});

t("donation.frequency.each.oneoff", { defaultValue: "Once" });
t("donation.frequency.each.weekly", { defaultValue: "each month" });
t("donation.frequency.each.monthly", { defaultValue: "each week" });

t("donation.frequency.feedback.oneoff", {
  defaultValue: "I'm donating {{amount}}",
});
t("donation.frequency.feedback.monthly", {
  defaultValue: "I'm donating {{amount}} {{frequency}}",
});

t("donation.frequency.oneoff", { defaultValue: "once" });
t("donation.frequency.weekly");
t("donation.frequency.yearly");
t("donation.frequency.monthly");
t("donation.button.cta.monthly", "Donate {{amount}} every month");
t("donation.button.cta.oneoff", "Donate {{amount}}");

// for campaign texts

t("campaign:title", { defaultValue: "" });
t("campaign:description", { defaultValue: "" });

t("campaign:share.generic", { defaultValue: "I signed this, you should too!" });
t("campaign:share.twitter", {
  defaultValue: "Worthwhile campaign, support it to #activism",
});

// for counter
t("progress.sign", {
  total: formatNumber(count, separator),
  goal: formatNumber(goal, separator),
});
t("progress.register", {
  total: formatNumber(count, separator),
  goal: formatNumber(goal, separator),
});
t("progress.email", {
  total: formatNumber(count, separator),
  goal: formatNumber(goal, separator),
});
t("progress.donate", {
  total: formatNumber(count, separator),
  goal: formatNumber(goal, separator),
});
t("progress.share", {
  total: formatNumber(count, separator),
  goal: formatNumber(goal, separator),
});
t("progress.twitter", {
  total: formatNumber(count, separator),
  goal: formatNumber(goal, separator),
});
