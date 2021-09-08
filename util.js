const {EOL} = require("os");

function constructParameterPath(parameterPrefix, envName, serviceName, keyName = '') {
        return `${parameterPrefix}/${envName}/Ecs/${serviceName}/${keyName}`
    }

 function convertEnvStringToObject(fileContent,fileName) {
     return fileContent.split(EOL).map((value) => {
         const separatorIndex = value.indexOf('=')
         if (separatorIndex === -1) {
             throw `${fileName} file : Value: ${value} Incorrect`
         }
         return {keyName: value.substring(0, separatorIndex), value: value.substring(separatorIndex + 1)}
     })
 }
    module.exports = {constructParameterPath,convertEnvStringToObject}
