//import { BodyComponent } from 'mjml-core'
const BodyComponent = require("mjml-core").BodyComponent;
const conditionalTag = require("mjml-core/lib/helpers/conditionalTag");

class MjI18nComponent extends BodyComponent {
  /* 
    Tell the parser that our component won't contain other mjml tags.
    This means any html tag inside its content will be left as it is.
    Without this, it would be parsed as mjml content.
    Examples of endingTags are mj-text, mj-button, mj-raw, etc.
  */
  static endingTag = true;
  static componentName = "mj-i18n";

  static dependencies = {
    // Tell the validator which tags are allowed as our component's parent
    "mj-hero": ["mj-i18n"],
    "mj-column": ["mj-i18n"],
    "mj-attributes": ["mj-i18n"],
    "mj-section": ["mj-i18n"],
    "mj-group": ["mj-i18n"],
    "mj-wrapper": ["mj-i18n"],
    // Tell the validator which tags are allowed as our component's children
    "mj-i18n": [],
  };

  static allowedAttributes = {
    i18nKey: "string",
    align: "enum(left,right,center,justify)",
    "background-color": "color",
    color: "color",
    "container-background-color": "color",
    "font-family": "string",
    "font-size": "unit(px)",
    "font-style": "string",
    "font-weight": "string",
    height: "unit(px,%)",
    "letter-spacing": "unitWithNegative(px,em)",
    "line-height": "unit(px,%,)",
    "padding-bottom": "unit(px,%)",
    "padding-left": "unit(px,%)",
    "padding-right": "unit(px,%)",
    "padding-top": "unit(px,%)",
    padding: "unit(px,%){1,4}",
    "text-decoration": "string",
    "text-transform": "string",
    "vertical-align": "enum(top,bottom,middle)",
  };

  static defaultAttributes = {
    align: "left",
    color: "#000000",
    "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    "font-size": "13px",
    "line-height": "1",
    padding: "10px 25px",
  };

  getStyles() {
    return {
      text: {
        "font-family": this.getAttribute("font-family"),
        "font-size": this.getAttribute("font-size"),
        "font-style": this.getAttribute("font-style"),
        "font-weight": this.getAttribute("font-weight"),
        "letter-spacing": this.getAttribute("letter-spacing"),
        "line-height": this.getAttribute("line-height"),
        "text-align": this.getAttribute("align"),
        "text-decoration": this.getAttribute("text-decoration"),
        "text-transform": this.getAttribute("text-transform"),
        color: this.getAttribute("color"),
        height: this.getAttribute("height"),
      },
    };
  }

  renderContent() {
    return `
      <div
        ${this.htmlAttributes({
          style: "text",
        })}
      >${this.getContent()}</div>
    `;
  }

  render() {
    const height = this.getAttribute("height");

    return height
      ? `
        ${conditionalTag(`
          <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td height="${height}" style="vertical-align:top;height:${height};">
        `)}
        ${this.renderContent()}
        ${conditionalTag(`
          </td></tr></table>
        `)}
      `
      : this.renderContent();
  }
}

exports.default = MjI18nComponent;
