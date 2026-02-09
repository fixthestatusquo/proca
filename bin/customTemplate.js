#!/usr/bin/env node
require("./dotenv.js");

const fs = require("fs");
const path = require("path");
const minimist = require("minimist");
const { api } = require("./config");


const args = minimist(process.argv.slice(2), {
  string: ["html", "name", "org", "lang", "subject"],
  boolean: ["help"],
  alias: { h: "help" },
});

const fail = (msg) => {
  console.error(`❌ ${msg}`);
  process.exit(1);
};

const help = () => {
  console.log(`
    Adds a custom email confirmation template for a specific organisation.
    This is a part of action  confirm setup.

    Usage:
      node bin/t.js --html=PATH --name=NAME --org=ORG --lang=LOCALE [--subject=TEXT]

    Required:
      --html     Path to HTML file
      --name     Template name (e.g. confirm, thankyou)
      --org      Org name (string, not ID)
      --lang     Locale (e.g. en, de, fr)

    Optional:
      --subject  Email subject
      --help     Show this help

    Example:
      node bin/t.js \\
        --org=nabu_de \\
        --name=confirm \\
        --lang=de \\
        --html=config/email/mjml/nabu_de/confirm.html \\
        --subject="{{campaign.title}}: Bitte bestätigen Sie Ihre Unterschrift"
    `);
  process.exit(0);
};

if (args.help) help();


// ---- validate args ----
const { html, name, org, lang, subject } = args;

if (!html) fail("--html is required");
if (!name) fail("--name is required");
if (!org) fail("--org is required");
if (!lang) fail("--lang is required");

const htmlPath = path.resolve(html);

if (!fs.existsSync(htmlPath)) {
  fail(`HTML file not found: ${htmlPath}`);
}

// ---- read html ----
let htmlContent;
try {
  htmlContent = fs.readFileSync(htmlPath, "utf8");
} catch (err) {
  fail(`Failed to read HTML file: ${err.message}`);
}

if (!htmlContent.trim()) {
  fail("HTML file is empty");
}

// ---- build input ----
const input = {
  name,
  locale: lang,
  html: htmlContent,
};

if (subject) {
  input.subject = subject;
}
const mutation = `
mutation query ($input: EmailTemplateInput!, $orgName: String!) {
  upsertTemplate(input: $input, orgName: $orgName)
}
`;



const variables = {
  input,
  orgName: org,
};

(async () => {
  console.log(`📨 Pushing template "${name}" [${lang}]`);

  try {
    const res = await api(mutation, variables);

    if (!res) {
      fail("GraphQL call returned no result");
    }
  } catch (err) {
    fail(err.message || "Unknown GraphQL error");
  }

  console.log("✅ Template saved.");
})();
