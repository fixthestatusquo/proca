const { pull } = require("./config");
const getId = require("./id");


const readJsonFromStdin = () => {
  let stdin = process.stdin
  let inputChunks = []

  stdin.resume()
  stdin.setEncoding('utf8')

  stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
  });

  return new Promise((resolve, reject) => {
    stdin.on('end', function () {
      let inputJSON = inputChunks.join()
      resolve(JSON.parse(inputJSON))
    })
    stdin.on('error', function () {
      reject(Error('error during read'))
    })
    stdin.on('timeout', function () {
      reject(Error('timout during read'))
    })
  })
}

const main = async () => {
  const json = await readJsonFromStdin();
  const id = json.id;
  const campaign = json.campaign.id;
  const org = json.org.name;
  console.log ("building page for ",id,campaign,org);
  await pull (id);
}

main()

