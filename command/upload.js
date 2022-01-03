const fs = require("fs");
const settingDir = '../setting'
const AWS = require('aws-sdk')
const path = require('path')

const parameterPrefix = '/VepDeploymentParameter'
const argv = require('minimist')(process.argv.slice(2));
const util = require("../utils/util.js")
const EnvObject = require("../utils/EnvObject");

async function uploadAllEnvToStore() {

}

async function uploadSingleEnvToStore(environmentName) {
    const targetEnvDir = path.join(__dirname,settingDir,environmentName,'env')
    const fileList = fs.readdirSync(targetEnvDir)
    const settingJson = require(path.join(__dirname,settingDir,environmentName,'setting.json'))

    const SSM = new AWS.SSM({
        accessKeyId: settingJson.accessKeyId,
        secretAccessKey: settingJson.secretAccessKey,
        region: settingJson.region,
    });
    for (let fileName of fileList) {
        const fileContent = await fs.readFileSync(path.join(targetEnvDir,fileName), {encoding: 'utf8', flag: 'r'})
        const envObject = new EnvObject(fileContent)
        for (let targetFileObject of envObject.fileObjectList) {
            let paramName = util.constructParameterPath(parameterPrefix,settingJson.environmentName,fileName.replace(/\.[^/.]+$/, ""),targetFileObject.keyName)
            let param = {
                Name: paramName ,
                Value: targetFileObject.value,
                Overwrite: true,
                Type: 'SecureString',
                Tier: 'Standard'
            }
            const result = await new Promise(function(resolve,reject) { SSM.putParameter(param, function(err, data) {
                if (err) reject(err);
                else     resolve(`Upload Param ${paramName} success: ${JSON.stringify(data)}`);
            })});
            console.log(result);
        }
        await sleep(2000)
    }
}

async function processCmd(arguments) {
    if (arguments.env) {
        await uploadSingleEnvToStore(argv.env)
    } else {
        await uploadAllEnvToStore()
    }
}



processCmd(argv).catch( (err) => {
    util.logError(err)
    process.exit(1)
})

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}