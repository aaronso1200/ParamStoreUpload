const util = require("./util.js")
const fs = require("fs");
const parameterPrefix = '/VepDeploymentParameter'

const settingDir = './setting'
const argv = require('minimist')(process.argv.slice(2));

async function compareFiles() {
    const targetEnvDir = `${settingDir}/${argv.env}/env`
    const fileList = fs.readdirSync(targetEnvDir)
    for (let fileName of fileList) {
        let isSync = true;
        const currentFileContent = fs.readFileSync(`${targetEnvDir}/${fileName}`, {encoding: 'utf8', flag: 'r'})
        const downloadedFilePath = `download/${argv.env}/env/${fileName}`
        const downloadedFileContent = fs.readFileSync(downloadedFilePath, {encoding: 'utf8', flag: 'r'})
        const currentFileObjectList = util.convertEnvStringToObject(currentFileContent, fileName)
        const downloadedFileObjectList = util.convertEnvStringToObject(downloadedFileContent, fileName)
        downloadedFileObjectList.forEach((downloadFileObject) => {
            const currentFileObject = currentFileObjectList.find(obj => obj.keyName === downloadFileObject.keyName)
            if (!currentFileObject.value || downloadFileObject.value !== currentFileObject.value) {
                console.log(`Param ${downloadFileObject.keyName} value not sync. Value in local file: ${currentFileObject.value}, Value in Param store: ${downloadFileObject.value}`)
                isSync = false
            }
        })
        if (isSync) {
            console.log(`Env Parameter for ${fileName} in ${argv.env} is sync with local file.`)
        }
    }

}

compareFiles()