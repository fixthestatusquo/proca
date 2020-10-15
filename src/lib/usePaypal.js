import { useEffect } from 'react';
const usePaypal = params => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src =  "https://paypal.com/sdk/js?commit=true&currency=EUR&client-id=" + (params.clientId || "sb");
    script.async = true;
    script.addEventListener('load', function() {
      console.log("paypal",window.paypal);
      const button = window.paypal.Buttons({
        fundingSource: 'paypal'
      });
      button.render(params.dom || "#paypal-container");
    });
    document.body.appendChild(script);
    return () => { //document.body.removeChild(script); 
    }
  }, [params]);
};
export default usePaypal;

/* old school
<form action="https://www.paypal.com/donate" method="post" target="_top">
<input type="hidden" name="cmd" value="_donations" />
<input type="hidden" name="business" value="account@example.org" />
<input type="hidden" name="currency_code" value="EUR" />
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
<img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
</form>
*/
