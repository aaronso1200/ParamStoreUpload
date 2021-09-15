const util = require("../utils/util.js")
const fs = require("fs");
const EnvObject = require("../utils/EnvObject");
const assert = require("assert");
const chalk = require("chalk");
const parameterPrefix = '/VepDeploymentParameter'
const path = require('path')
const downloadDir = '../download'

const settingDir = '../setting'
const argv = require('minimist')(process.argv.slice(2));


async function compareAllEnv() {
    const settingDirList = await fs.readdirSync(path.join(__dirname,settingDir), {withFileTypes: true}).filter(dirent => dirent.isDirectory()).map(direntObject => direntObject.name)
    for (let envDirName of settingDirList) {
        await compareSingleEnv(envDirName)
    }
}

async function compareSingleEnv(environmentName) {
    const targetEnvDir = path.join(__dirname,settingDir,environmentName,'env')
    const fileList = fs.readdirSync(targetEnvDir)
    for (let fileName of fileList) {
        const currentFileContent = await fs.readFileSync(path.join(targetEnvDir,fileName), {encoding: 'utf8', flag: 'r'})
        const downloadedFileContent = await fs.readFileSync(path.join(__dirname,downloadDir,environmentName,'env',fileName), {encoding: 'utf8', flag: 'r'})
        const currentFileObjectList = new EnvObject(currentFileContent).fileObjectList
        const downloadedFileObjectList = new EnvObject(downloadedFileContent).fileObjectList

        let isEnvObjSame = compareEnvObjectList(currentFileObjectList,downloadedFileObjectList);
        if (isEnvObjSame) {
            console.log(`Env Parameter for ${chalk.green.bold(fileName)} in ${chalk.yellow.bold(environmentName)} is sync with local file.`)
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


async function processCmd(arguments) {
    if (arguments.env) {
        await compareSingleEnv(argv.env)
    } else {
        await compareAllEnv()
    }
}


processCmd(argv).catch( (err) => {
    util.logError(err.message)
    process.exit(1)
})