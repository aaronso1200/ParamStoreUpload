const fs = require('fs')
const AWS = require('aws-sdk')
const {EOL} = require("os");
const settingDir = './setting'
const parameterPrefix = '/VepDeploymentParameter'
const util = require('./util')
const argv = require('minimist')(process.argv.slice(2));

async function downloadAllEnvFromStore() {
    const settingDirList = await fs.readdirSync(settingDir, {withFileTypes: true}).filter(dirent => dirent.isDirectory()).map(direntObject => direntObject.name)
    for (let envDirName of settingDirList) {
        await downloadSingleEnvFromStore(envDirName)
    }
}

async function downloadSingleEnvFromStore(environmentName) {
    const settingJson = require(`${settingDir}/${environmentName}/setting.json`)
    const SSM = new AWS.SSM({
        accessKeyId: settingJson.accessKeyId,
        secretAccessKey: settingJson.secretAccessKey,
        region: 'ap-east-1',
    });
    const fileList = await fs.readdirSync(settingDir + '/' + environmentName + '/env')
    for (let fileName of fileList) {
        const path = util.constructParameterPath(parameterPrefix, settingJson.environmentName, fileName.replace(/\.[^/.]+$/, ""))
        const param = {
            Path: path,
            WithDecryption: true
        }
        const parameters  = (await new Promise(function(resolve, reject) {SSM.getParametersByPath(param, function (err, data) {
            if (err) reject(err);
            else resolve(data)
        })})).Parameters.map((obj) => `${obj.Name.replace(path,"")}=${obj.Value}`).join(EOL)

        const writeFilePath = `./download/${environmentName}/env/${fileName}`
        await util.writeFile(writeFilePath,parameters)
    }
}

async function processCmd() {
    if (argv.env) {
        await downloadSingleEnvFromStore(argv.env)
    } else {
        await downloadAllEnvFromStore()
    }
}

processCmd().catch((err) => {
    util.logError(err.message)
    process.exit(1)
})