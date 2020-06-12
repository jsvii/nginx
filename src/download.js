const path = require('path');
const util = require('util');
const { trim } = require('lodash');
const { writeFile } = require('fs');
const processExec = util.promisify(require('child_process').exec);
const assert = require('assert');
const fsWriteFile = util.promisify(writeFile);
const downloadPath = path.resolve(__dirname, '../root');
const downloadZshFile = path.resolve(__dirname, 'download.zsh');
const errorFile = path.resolve(__dirname, '../root/error.log');
const successFile = path.resolve(__dirname, '../root/success.log');
const zshPath = '/usr/bin/zsh';
const maxProcessNum = 5;

async function download(jsonArr) {
    const asyncArr = [];
    const promiseExec = [];
    const exeSuccessMsgs = [];
    const exeErrorMsgs = [];

    genAsync({
        title: "app doc",
        dir: downloadPath,
        assets: jsonArr
    });
    let num = maxProcessNum;
    while(num > 0) {
        promiseExec.push(Promise.resolve(true));
        num--;
    }

    while(asyncArr.length > 0) {
        promiseExec.forEach((p, index) => {
            const exe = asyncArr.pop();
            if (!exe) {
                return;
            }
            promiseExec[index] = p.then(exe);
        });
    }

    promiseExec.forEach((p) => {
        p.catch((err) => {
            console.log(`promise exe error:\n${err}`);
        });
    });

    await Promise.all(promiseExec);

    fsWriteFile(errorFile, `${(new Date()).toLocaleString()}\n ${exeErrorMsgs.join('\n')}`);
    fsWriteFile(successFile, `${(new Date()).toLocaleString()}\n ${exeSuccessMsgs.join('\n')}`);


    async function handleDownload(json) {
        const { dir, download_url, title } = json;
        const execScript = `${downloadZshFile} --dir=${dir} --url=${download_url}`;
        console.log(`exec start: ${execScript}`);
        const { stdout, stderr } = await processExec(execScript, {
            shell: '/usr/bin/zsh',
            windowsHide: true
        });

        if (stderr) {
            exeErrorMsgs.push(execScript, stderr);
            return true;
        }

        exeSuccessMsgs.push(execScript, stdout);
        return true;
    }

    function genAsync(json, parentDir) {
        let subDir = parentDir;
        if (json.dir) {
            subDir = path.resolve(parentDir, json.dir);
        }

        if (json.assets && json.assets.length > 0) {
            json.assets.forEach((json) => {
                genAsync(json, subDir);
            });

            return;
        }

        if (json.dir) {
            subDir = path.resolve(parentDir, json.dir);
        }
        json.dir = subDir;

        try {
            assert(!!trim(json.download_url));
        } catch(e) {
            console.error('a config err', JSON.stringify(json));
            console.log(e);
            process.exit(1);
        }

        asyncArr.push(handleDownload.bind(null, json));
    };



};

exports.download = download;
