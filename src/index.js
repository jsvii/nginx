const { readFile, access } = require('fs');
const { promisify } = require('util');
const path = require('path');
const { trim } = require('lodash');
const { download } = require('./download');
const fsReadFile = promisify(readFile);
const fsAccess = promisify(access);

const indexFile = path.resolve(__dirname, 'assets/index.conf');
const COMMENT_SIGN = '#';

(async () => {
    const indexTxt = await fsReadFile(indexFile, 'utf8');
    const jsons = indexTxt.split('\n')
          .filter((str) => { return (!!trim(str)) && (str.indexOf(COMMENT_SIGN) === -1); })
          .map(str => trim(str));
    const allJsonPromise = [];

    jsons.forEach((jsonFileName) => {
        allJsonPromise.push((async () => {
            const jsonFilePath = path.resolve(__dirname, `assets/${jsonFileName}`);

            try {
                await fsAccess(jsonFilePath);
            } catch (e) {
                console.error(`no such file jsonFilePath, error is \n ${e}`);
                process.exit(1);
            }
            const jsonRaw = await fsReadFile(jsonFilePath, 'utf8');
            let jsonParsed = {};
            try {
                jsonParsed = JSON.parse(jsonRaw);
            } catch (e) {
                console.error(`parse Json error, file is:\n ${jsonFilePath} `);
                process.exit(1);
            }

            return jsonParsed;
        })());
    });

    const jsonContents = await Promise.all(allJsonPromise);

    download(jsonContents);
})();
