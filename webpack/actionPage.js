/**
  * Generates content of src/actionPage.js on the fly based on chosen action page json config
  * The config should be placed in `config/123.json` and selected by setting env variable
  * actionpage=123
  */ 
const {getConfigOverride} = require('./config')

const stepComponent = {
  'petition': 'Petition',
  'share': 'Share',
  'button': 'FAB',
  'twitter': 'Twitter',
  'dialog': 'Dialog',
  'Ep': 'Ep',
  'DonateAmount': 'DonateAmount',
  'DonateStripe': 'DonateStripe',
  'clickify': 'Clickify',
  'html': 'Html',
  'register': 'Register',
  'register.CH': 'bespoke/Register-CH',
  'download': 'bespoke/Download',
};

module.exports = (defaultCode) => {
  const config = getConfigOverride({
    "journey": ["petition", "share"]
  })

  const code = createCode(config)
  console.log('code:', code)

  return code
}

function createCode(config) {
  const nl = "\n"
  const steps = config.journey.flat().map(stepToFilename) // XXX journey is flat array in the backend
  let portals = []

  if (config.portal) {
    config.portal.forEach((p) => {
      let c = p.component ? p.component : p
      c = stepToFilename(c)
      portals.push(c)
    })
  }

  const components = new Set()
  for (const x of steps) {components.add(x) }
  for (const x of portals) {components.add(x) }

  let src = ``

  src += [...components].map((s) => {
    const n = componentFilenameToModulename(s)
    return `import ${n} from './components/${s}'`
  }).join("\n") + nl + nl

  src += `export const steps = {${steps.map(componentFilenameToModulename).join(',')}}` + nl + nl
  src += `export const portals = {${portals.map(componentFilenameToModulename).join(',')}}` + nl + nl
  src += `export const config = ${JSON.stringify(config, null, 2)}`+ nl

  return src
}

function stepToFilename(step) {
  if (step in stepComponent) {
    return stepComponent[step]
  } else {
    return step
  }
}

function componentFilenameToModulename(compPath) {
  return compPath.replace('/', '_')
}
