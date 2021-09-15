const fs = require("fs");
const settingDir = './setting'
const AWS = require('aws-sdk')

const parameterPrefix = '/VepDeploymentParameter'
const argv = require('minimist')(process.argv.slice(2));
const util = require("../utils/util.js")
const EnvObject = require("../utils/EnvObject");

async function uploadEnvToParameterStore() {
    const targetEnvDir = `${settingDir}/${argv.env}/env`
    const fileList = fs.readdirSync(targetEnvDir)
    const settingJson = require(`${settingDir}/${argv.env}/setting.json`)

    const SSM = new AWS.SSM({
        accessKeyId: settingJson.accessKeyId,
        secretAccessKey: settingJson.secretAccessKey,
        region: 'ap-east-1',
    });

    fileList.forEach((fileName) => {
        const envObject = new EnvObject(`${targetEnvDir}/${fileName}`)
        envObject.fileObjectList.forEach(async (value) => {
            let paramName = util.constructParameterPath(parameterPrefix,settingJson.environmentName,fileName.replace(/\.[^/.]+$/, ""),value.keyName)
            let param = {
                Name: paramName ,
                Value: value.value,
                Overwrite: true,
                Type: 'SecureString',
                Tier: 'Standard'
            }
            const result = await new Promise(function(resolve,reject) { SSM.putParameter(param, function(err, data) {
                if (err) reject(err);
                else     resolve(`Upload Param ${paramName} success: ${JSON.stringify(data)}`);
            })});
            console.log(result);
        })
    })
}
uploadEnvToParameterStore();
