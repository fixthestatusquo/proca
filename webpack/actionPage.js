/**
 * Generates content of src/actionPage.js on the fly based on chosen action page json config
 * The config should be placed in `config/123.json` and selected by setting env variable
 * actionpage=123
 */
const { getConfigOverride } = require("./config");

// TODO: add lazy load and /* webpackChunkName: "steps" */ './StepComponent'

const stepComponent = {
  petition: "Petition",
  share: "Share",
  button: "FAB",
  twitter: "Twitter",
  dialog: "Dialog",
  Ep: "Ep",
  html: "Html",
  register: "Register",
  "register.CH": "bespoke/Register-CH",
};

module.exports = (id) => {
  const [filename, config] = getConfigOverride(!isNaN(id) && id);

  const code = createCode(filename, config);

  if (process.env["DEBUG"] && process.env["DEBUG"] === "CODE") {
    console.debug(code);
    process.exit(1);
  }

  return code;
};

function createCode(filename, config) {
  const nl = "\n";
  let steps = [];
  let portals = [];
  let imports = [];
  const components = new Set();

  if (config.journey) {
    if (!(config.journey instanceof Array)) {
      throw new Error(
        `config.journey should be an array!, is: ${config.journey}`,
      );
    }

    steps = config.journey
      .reduce((acc, val) => acc.concat(val), [])
      .map(stepToFilename); // XXX journey is flat array in the backend
  }

  if (config.portal) {
    if (!(config.portal instanceof Array)) {
      throw new Error(
        `config.portal should be an array!, is: ${config.portal}`,
      );
    }
    config.portal.forEach((p) => {
      let c = p.component ? p.component : p;
      c = stepToFilename(c);
      portals.push(c);
    });
  }
  console.log("import", config.import);
  if (config.import) {
    if (!(config.import instanceof Array)) {
      throw new Error(
        `config.component should be an array!, is: ${config.component}`,
      );
    }
    config.import.forEach((p) => {
      let c = p.component ? p.component : p;
      c = stepToFilename(c);
      imports.push(c);
      components.add(c);
    });
  }

  for (const x of steps) {
    components.add(x);
  }
  for (const x of portals) {
    components.add(x);
  }

  let src = ``;

  src +=
    [...components]
      .map((s) => {
        const n = componentFilenameToModulename(s);
        return `import ${n} from './components/${s}'`;
      })
      .join("\n") +
    nl +
    nl;

  src += `export const config = ` + JSON.stringify(config) + nl;
  src +=
    `export const steps = {${steps
      .filter(unique)
      .map(componentFilenameToModulename)
      .join(",")}}` +
    nl +
    nl;
  src +=
    `export const imports = {${imports
      .filter(unique)
      .map(componentFilenameToModulename)
      .join(",")}}` +
    nl +
    nl;
  src +=
    `export const portals = {${portals
      .filter(unique)
      .map(componentFilenameToModulename)
      .join(",")}}` +
    nl +
    nl;

  return src;
}

function stepToFilename(step) {
  if (step in stepComponent) {
    return stepComponent[step];
  } else {
    return step;
  }
}

function componentFilenameToModulename(compPath) {
  return compPath.replace(/\//g, "_");
}

function unique(value, index, self) {
  return self.indexOf(value) === index;
}
