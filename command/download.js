const fs = require('fs')
const AWS = require('aws-sdk')
const {EOL} = require("os");
const settingDir = '../setting'
const downloadDir = '../download'

const parameterPrefix = '/VepDeploymentParameter'
const util = require('../utils/util')
const argv = require('minimist')(process.argv.slice(2));
const path = require('path')

async function downloadAllEnvFromStore() {
    const settingDirList = await fs.readdirSync(path.join(__dirname,settingDir), {withFileTypes: true}).filter(dirent => dirent.isDirectory()).map(direntObject => direntObject.name)
    for (let envDirName of settingDirList) {
        await downloadSingleEnvFromStore(envDirName)
    }
}

async function downloadSingleEnvFromStore(environmentName) {
    const settingJson = require(path.join(__dirname,settingDir,environmentName,'setting.json'))
    const SSM = new AWS.SSM({
        accessKeyId: settingJson.accessKeyId,
        secretAccessKey: settingJson.secretAccessKey,
        region: 'ap-east-1',
    });
    const fileList = await fs.readdirSync(path.join(__dirname,settingDir,environmentName,'env'))
    for (let fileName of fileList) {
        const paramPath = util.constructParameterPath(parameterPrefix, settingJson.environmentName, fileName.replace(/\.[^/.]+$/, ""))
        const param = {
            Path: paramPath,
            WithDecryption: true
        }
        const parameters  = (await new Promise(function(resolve, reject) {SSM.getParametersByPath(param, function (err, data) {
            if (err) reject(err);
            else resolve(data)
        })})).Parameters.map((obj) => `${obj.Name.replace(paramPath,"")}=${obj.Value}`).join(EOL)

        const writeFilePath = path.join(__dirname,downloadDir,environmentName,'env',fileName)
        await util.writeFile(writeFilePath,parameters)
    }
}

async function processCmd(arguments) {
    if (arguments.env) {
        await downloadSingleEnvFromStore(argv.env)
    } else {
        await downloadAllEnvFromStore()
    }
}

processCmd(argv).catch((err) => {
    util.logError(err.message)
    process.exit(1)
})