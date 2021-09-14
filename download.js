const fs = require('fs')
const AWS = require('aws-sdk')
const {EOL} = require("os");
const settingDir = './setting'
const parameterPrefix = '/VepDeploymentParameter'
const util = require('./util')


async function downloadEnvFromParameterStore() {
    const settingDirList = await fs.readdirSync(settingDir, {withFileTypes: true}).filter(dirent => dirent.isDirectory()).map(direntObject => direntObject.name)
    for (let envDirName of settingDirList) {
        const settingJson = require(`${settingDir}/${envDirName}/setting.json`)
        const SSM = new AWS.SSM({
            accessKeyId: settingJson.accessKeyId,
            secretAccessKey: settingJson.secretAccessKey,
            region: 'ap-east-1',
        });
        const fileList = await fs.readdirSync(settingDir + '/' + envDirName + '/env')
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

            const writeFilePath = `./download/${envDirName}/env/${fileName}`
            await util.writeFile(writeFilePath,parameters)
        }
    }
}


downloadEnvFromParameterStore().catch((err) => {
    util.logError(err.message)
})