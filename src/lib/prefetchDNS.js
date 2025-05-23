//import { prefetchDNS } from 'react-dom'; available on react19 only

function prefetchDNS(url) {
  const linkId = url.replace("https://", "").replace(/[^a-zA-Z0-9-_]/g, "-");

  // Check if a prefetch link with the specified id already exists
  if (document.getElementById(linkId)) return;

  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "dns-prefetch";
  link.href = url;
  document.head.appendChild(link);
  //  console.log("Prefetch added for:", url, document.head);
}

export default prefetchDNS;
