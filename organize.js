
const util = require("./util.js")
const fs = require("fs");
const EnvObject = require("./utils/EnvObject");
const {EOL} = require("os");
const settingDir = './setting'
const argv = require('minimist')(process.argv.slice(2));


async function organizeAllEnvFiles() {
    const settingDirList = await fs.readdirSync(settingDir, {withFileTypes: true}).filter(dirent => dirent.isDirectory()).map(direntObject => direntObject.name)
    for (let envDirName of settingDirList) {
        await organizeSingleEnvFile(envDirName)
    }
}

async function organizeSingleEnvFile(environmentName) {
    const targetEnvDir = `${settingDir}/${environmentName}/env`
    const fileList = fs.readdirSync(targetEnvDir)
    for (let fileName of fileList) {
        const targetFile = `${targetEnvDir}/${fileName}`
        const targetFileContent = fs.readFileSync(targetFile,{encoding: 'utf8', flag: 'r'})
        const currentEnvObject = new EnvObject(targetFileContent)
        await util.writeFile(targetFile,currentEnvObject.organize().convertToEnvString())
    }
}

async function processCmd() {
    if (argv.env) {
        await organizeSingleEnvFile(argv.env)
    } else {
        await organizeAllEnvFiles()
    }
}

processCmd().catch((err) => {
    util.logError(err.message)
    process.exit(1)
})