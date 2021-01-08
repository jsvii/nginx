const { promisify } = require('util');
const { writeFile, rmdir, mkdir, readFile } = require('fs');
const path = require('path');
const fsWriteFile = promisify(writeFile);
const fsReadFile = promisify(readFile);
const fsRmdir = promisify(rmdir);
const fsMkdir = promisify(mkdir);
const otherDocs = require('../assets/other/docs.json');
const Handlebars = require('handlebars');
const rootPath = path.resolve(__dirname, '../../root/');
const confDir = path.resolve(__dirname, '../../conf/');
const configFilePath = path.resolve(confDir, 'nginx.conf');

async function genNginxConf() {
    const nginxFileContent = await fsReadFile(path.resolve(__dirname, 'nginx.sample.conf'), 'utf8');
    const template = Handlebars.compile(nginxFileContent);
    const configContent = template({
        docs: otherDocs,
        projectPath: rootPath
    });

    await fsRmdir(confDir, {recursive: true});
    await fsMkdir(confDir, {recursive: true});
    await fsWriteFile(configFilePath, configContent);
    console.log(`nginx file update successfully on ${configFilePath}`);
}

exports.genNginxConf = genNginxConf;
