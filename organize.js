const util = require("./util.js")
const fs = require("fs");
const {EOL} = require("os");
const settingDir = './setting'
const argv = require('minimist')(process.argv.slice(2));

async function organizeEnvFiles() {
    const targetEnvDir = `${settingDir}/${argv.env}/env`
    const fileList = fs.readdirSync(targetEnvDir)
    for (let fileName of fileList) {
        const targetFile = `${targetEnvDir}/${fileName}`
        const currentFileContent = fs.readFileSync(targetFile, {encoding: 'utf8', flag: 'r'})
        const currentFileObjectList = util.convertEnvStringToObject(currentFileContent, fileName)
        const organizedEnvContent = currentFileObjectList.sort((a,b) => {
            return a.keyName > b.keyName?0:-1}).map((obj) => {return `${obj.keyName}=${obj.value}`}).join(EOL)
        console.log(organizedEnvContent);
        fs.writeFileSync(targetFile,organizedEnvContent)
    }
}

organizeEnvFiles()