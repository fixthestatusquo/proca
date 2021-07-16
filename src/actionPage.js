// configure a donation journey!

import donate_Amount from "./components/donate/Amount";
import donate_Tab from "./components/donate/Tab";

const config = {
  actionPage: 1,
  actionpage: 1,
  organisation: "WeMove",
  lang: "en",
  filename: "birds/minimumbasicseeds",
  lead: {
    name: "birdsbirdsbirds",
    title: "Birds Birds Birds",
  },
  campaign: {
    title: "Seeds",
  },
  journey: ["donate/Amount", "donate/Tab"],
  component: {
    donation: {
      currency: {
        code: "EUR",
        symbol: "€",
      },
      frequency: {
        default: "monthly",
        options: ["oneoff", "monthly"],
      },
      average: {
        oneoff: 9,
        monthly: 4,
      },
      amount: {
        oneoff: [3, 5, 10, 25, 50, 100, 200],
        monthly: [9, 8, 7, 6, 5],
        default: 5,
      },
      paypal: {
        clientId:
          "ATeeC07lXxwMgsNNwJyaDHQw83ebljvrF3dOcM16_j8Qs8ZTvyVnrDWWYsPHBspM_b63eGN5rWohuAXY",
        planId: "P-7V29162651010031FMDM6IHA",
        styles: {
          shape: "rect",
          color: "gold",
          size: "responsive",
          height: 55,
          layout: "vertical",
          label: "paypal",
        },
        receipt_description: "WeMove Europe Donation",
      },
      stripe: {
        productId: "prod_JjiIPD7pifRJMk",
        publishableKey: "pk_test_vpPoPvgOhJe0IzOZJ2d4rPE9",
      },
    },
  },
  layout: {
    variant: "filled",
  },
  portal: [],
  locales: {},
  template: true,
};

const steps = { donate_Amount, donate_Tab };
const portals = [];

export { steps, portals, config };
