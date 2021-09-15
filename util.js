const fs = require("fs");
const {EOL} = require("os");
const path = require('path');
const chalk = require('chalk');
const boxen = require('boxen');

function constructParameterPath(parameterPrefix, envName, serviceName, keyName = '') {
    return `${parameterPrefix}/${envName}/Ecs/${serviceName}/${keyName}`
}

// function convertEnvStringToObject(fileContent, fileName) {
//     return fileContent.split(EOL).map((value) => {
//         const separatorIndex = value.indexOf('=')
//         if (separatorIndex === -1) {
//             throw `${fileName} file : Value: ${value} Incorrect`
//         }
//         return {keyName: value.substring(0, separatorIndex), value: value.substring(separatorIndex + 1)}
//     })
// }

async function writeFile(fullFilePath,content) {
    const filePath = path.parse(fullFilePath).dir
    console.log(filePath);
    if (!fs.existsSync(filePath)) {
        await fs.mkdirSync(filePath,{recursive:true})
    }
    await fs.writeFileSync(fullFilePath,content)
    console.log(`Write content to file: ${fullFilePath} success!`);
}

function logError(errMessage) {
    const chalkMessage = chalk.red.bold(errMessage);
    const boxenOptions = {
        padding: 1,
        margin: 1,
        borderStyle: "bold",
        borderColor: "red"
    };
    console.log(boxen(chalkMessage, boxenOptions))
}


module.exports = {constructParameterPath,writeFile,logError}
