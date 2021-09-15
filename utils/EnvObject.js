const fs = require("fs");
const {EOL} = require("os");

 module.exports = class EnvObject {
     constructor(fileContent) {
        this.fileObjectList = fileContent.split(EOL).map((value,index) => {
            const separatorIndex = value.indexOf('=')
            if (separatorIndex === -1) {
                throw `Value : ${value} Incorrect`
            }
            return {keyName: value.substring(0, separatorIndex), value: value.substring(separatorIndex + 1)}
        })
    }

    organize() {
        this.fileObjectList = this.fileObjectList.sort((a, b) => {
            return a.keyName > b.keyName ? 0 : -1
        })
        return this;
    }

    convertToEnvString() {
        return this.fileObjectList.map((obj) => {
            return `${obj.keyName}=${obj.value}`
        }).join(EOL)
    }

    getFileObjectList() {
         return this.fileObjectList
    }
}