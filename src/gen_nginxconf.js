const { promisify } = require('util');
const { writeFile, rmdir, mkdir, readFile } = require('fs');
const path = require('path');
const fsWriteFile = promisify(writeFile);
const fsReadFile = promisify(readFile);
const fsRmdir = promisify(rmdir);
const fsMkdir = promisify(mkdir);
const otherDocs = require('./assets/other_docs.json');
const Handlebars = require('handlebars');

async function genNginxConf() {
    const nginxFileContent = await fsReadFile(path.resolve(__dirname, './nginx/nginx.sample.conf'), 'utf8');

    const template = Handlebars.compile(nginxFileContent);
    const configContent = template({
        docs: otherDocs,
        projectPath: path.resolve(__dirname, '../')
    });
    const confDir = path.resolve(__dirname, '../conf/');

    await fsRmdir(confDir, {recursive: true});
    await fsMkdir(confDir, {recursive: true});

    await fsWriteFile(path.resolve(confDir, 'nginx.conf'), configContent);
}

exports.genNginxConf = genNginxConf;
