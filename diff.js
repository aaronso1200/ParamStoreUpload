const util = require("./util.js")
const fs = require("fs");
const EnvObject = require("./utils/EnvObject");
const assert = require("assert");
const chalk = require("chalk");
const parameterPrefix = '/VepDeploymentParameter'

const settingDir = './setting'
const argv = require('minimist')(process.argv.slice(2));

async function compareFiles() {
    const targetEnvDir = `${settingDir}/${argv.env}/env`
    const fileList = fs.readdirSync(targetEnvDir)
    for (let fileName of fileList) {
        const currentFileContent = fs.readFileSync(`${targetEnvDir}/${fileName}`, {encoding: 'utf8', flag: 'r'})
        const downloadedFilePath = `download/${argv.env}/env/${fileName}`
        const downloadedFileContent = fs.readFileSync(downloadedFilePath, {encoding: 'utf8', flag: 'r'})
        const currentFileObjectList = new EnvObject(currentFileContent).fileObjectList
        const downloadedFileObjectList = new EnvObject(downloadedFileContent).fileObjectList

        let isSync = compareEnvObjectList(currentFileObjectList,downloadedFileObjectList);
        if (isSync) {
            console.log(`Env Parameter for ${fileName} in ${argv.env} is sync with local file.`)
        }
    }

}

function compareEnvObjectList(currentFileObjectList,downloadedFileObjectList) {
    let result = true;
    for (let downloadFileObject of downloadedFileObjectList) {
        const currentFileObject = currentFileObjectList.find(obj => obj.keyName === downloadFileObject.keyName)
        if (!currentFileObject.value || downloadFileObject.value !== currentFileObject.value) {
            console.log(`Param ${chalk.green.bold(downloadFileObject.keyName)} value not sync. Value in local file: ${chalk.green.bold(currentFileObject.value)}, Value in Param store: ${chalk.green.bold(downloadFileObject.value)}`)
            result =  false
        }
    }
    return result;
}


compareFiles().catch( (err) => {
    util.logError(err.message)
})