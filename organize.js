
const util = require("./util.js")
const fs = require("fs");
const EnvObject = require("./EnvObject");
const {EOL} = require("os");
const settingDir = './setting'
const argv = require('minimist')(process.argv.slice(2));


async function organizeEnvFiles() {
    const targetEnvDir = `${settingDir}/${argv.env}/env`
    const fileList = fs.readdirSync(targetEnvDir)
    for (let fileName of fileList) {
        const targetFile = `${targetEnvDir}/${fileName}`
        const currentEnvObject = new EnvObject(targetFile)
        await util.writeFile(targetFile,currentEnvObject.organize().convertToEnvString())
    }
    console.log("Organize Env File Success")
}

organizeEnvFiles().catch((err) => {
    util.logError(err.message)
})