const contentOf = (doc, selectors) => {
  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (!element) continue;
    const value =
      element.getAttribute?.("content") ?? element.textContent ?? "";
    if (value.trim()) return value.trim();
  }
  return "";
};

const absoluteUrl = (value, base) => {
  if (!value) return "";
  try {
    return new URL(value, base).href;
  } catch {
    return "";
  }
};

const providerFromUrl = url => {
  try {
    const host = new URL(url).host.replace(/^www[a-zA-Z0-9]*\./, "");
    return host.replace(".co.", ".").split(".").slice(0, -1).join(" ");
  } catch {
    return "";
  }
};

export const getMetadata = (doc = document, url = window.location) => {
  const base = typeof url === "string" ? url : url?.href;
  return {
    title: contentOf(doc, [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'meta[property="twitter:title"]',
      'meta[name="hdl"]',
      "title",
    ]),
    description: contentOf(doc, [
      'meta[property="og:description"]',
      'meta[name="description"]',
    ]),
    image: absoluteUrl(
      contentOf(doc, [
        'meta[property="og:image:secure_url"]',
        'meta[property="og:image"]',
        'meta[property="og:image:url"]',
        'meta[name="twitter:image"]',
        'meta[property="twitter:image"]',
        'meta[name="thumbnail"]',
      ]),
      base
    ),
    provider:
      contentOf(doc, ['meta[property="og:site_name"]']) ||
      providerFromUrl(base),
  };
};
