import { describe, expect, it } from "vitest";
import { getMetadata } from "./metadata.js";

const doc = html => new DOMParser().parseFromString(html, "text/html");
const url = "https://www.example.co.uk/page";

describe("getMetadata", () => {
  it("prefers Open Graph tags", () => {
    const metadata = getMetadata(
      doc(`
        <title>Document title</title>
        <meta property="og:title" content="OG title" />
        <meta property="og:description" content="OG description" />
        <meta property="og:image" content="/image.jpg" />
        <meta property="og:site_name" content="Example" />
      `),
      url
    );

    expect(metadata).toEqual({
      title: "OG title",
      description: "OG description",
      image: "https://www.example.co.uk/image.jpg",
      provider: "Example",
    });
  });

  it("falls back to Twitter and document tags", () => {
    const metadata = getMetadata(
      doc(`
        <title>Document title</title>
        <meta name="twitter:title" content="Twitter title" />
        <meta name="description" content="Meta description" />
        <meta name="twitter:image" content="https://cdn.example/image.jpg" />
      `),
      url
    );

    expect(metadata.title).toBe("Twitter title");
    expect(metadata.description).toBe("Meta description");
    expect(metadata.image).toBe("https://cdn.example/image.jpg");
    expect(metadata.provider).toBe("example");
  });

  it("returns empty strings when metadata is missing", () => {
    expect(getMetadata(doc("<title></title>"), url)).toEqual({
      title: "",
      description: "",
      image: "",
      provider: "example",
    });
  });
});
