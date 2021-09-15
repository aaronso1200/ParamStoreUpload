const util = require("../utils/util.js")
const fs = require("fs");
const EnvObject = require("../utils/EnvObject");
const assert = require("assert");
const chalk = require("chalk");
const parameterPrefix = '/VepDeploymentParameter'

const settingDir = './setting'
const argv = require('minimist')(process.argv.slice(2));


async function compareAllEnv() {
    const settingDirList = await fs.readdirSync(settingDir, {withFileTypes: true}).filter(dirent => dirent.isDirectory()).map(direntObject => direntObject.name)
    for (let envDirName of settingDirList) {
        await compareSingleEnv(envDirName)
    }
}

async function compareSingleEnv(environmentName) {
    const targetEnvDir = `${settingDir}/${environmentName}/env`
    const fileList = fs.readdirSync(targetEnvDir)
    for (let fileName of fileList) {
        const currentFileContent = await fs.readFileSync(`${targetEnvDir}/${fileName}`, {encoding: 'utf8', flag: 'r'})
        const downloadedFileContent = await fs.readFileSync(`download/${argv.env}/env/${fileName}`, {encoding: 'utf8', flag: 'r'})
        const currentFileObjectList = new EnvObject(currentFileContent).fileObjectList
        const downloadedFileObjectList = new EnvObject(downloadedFileContent).fileObjectList

        let isEnvObjSame = compareEnvObjectList(currentFileObjectList,downloadedFileObjectList);
        if (isEnvObjSame) {
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


async function processCmd() {
    if (argv.env) {
        await compareSingleEnv(argv.env)
    } else {
        await compareAllEnv()
    }
}


processCmd().catch( (err) => {
    util.logError(err.message)
    process.exit(1)
})