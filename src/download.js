const path = require('path');
const { promisify } = require('util');
const { trim } = require('lodash');
const { writeFile, mkdir } = require('fs');
const { createHash } = require('crypto');
const processExec = promisify(require('child_process').exec);
const assert = require('assert');
const fsMkdir = promisify(writeFile);
const fsWriteFile = promisify(writeFile);
const downloadPath = path.resolve(__dirname, '../.cached');
const rootPath = path.resolve(__dirname, '../root');
const errorFile = path.resolve(downloadPath, 'error-msg.log');
const successFile = path.resolve(downloadPath, 'success-msg.log');
const sysErrorFile = path.resolve(downloadPath, 'error.log');
const downloadZshFile = path.resolve(__dirname, 'shell/download.zsh');
const maxProcessNum = 5;

async function download(jsonArr) {
    const asyncArr = [];
    const promiseExec = [];
    const exeSuccessMsgs = [];
    const exeErrorMsgs = [];
    const sysErrorMsgs = [];

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

    console.log('==============end==============');

    fsWriteFile(errorFile, `${(new Date()).toLocaleString()}\n ${exeErrorMsgs.join('\n')}`);
    fsWriteFile(successFile, `${(new Date()).toLocaleString()}\n ${exeSuccessMsgs.join('\n')}`);
    fsWriteFile(sysErrorFile, `${(new Date()).toLocaleString()}\n ${sysErrorMsgs.join('\n')}`);

    async function handleDownload(json) {
        const { dir, download_url } = json;
        const destDir = path.resolve(dir.replace(downloadPath, rootPath), getFileName(download_url));
        let execScript = `${downloadZshFile} --download_dir=${dir} --download_url=${download_url} --dest_dir=${destDir}`;

        console.log(`===========================================`);
        console.log(`exec start:\n ${execScript}`);

        try {
            const { stdout, stderr } = await processExec(execScript);

            console.log(`exec end:\n ${execScript}`);
            console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

            if (stderr) {
                exeErrorMsgs.push(execScript, stderr);

                return true;
            }

            exeSuccessMsgs.push(execScript, stdout);
        } catch(e) {
            sysErrorMsgs.push(execScript, e);
        }

        return true;
    }

    function genAsync(json, parentDir) {
        let subDir = parentDir;

        if (json.assets && json.assets.length > 0) {
            /* 只有 目录需要dir，文件是shell 分析出来的 */
            if (json.dir) {
                subDir = path.resolve(parentDir, json.dir);
            }
            json.assets.forEach((json) => {
                genAsync(json, subDir);
            });

            return;
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

    function getFileName(str) {
        return createHash('sha1').update(str).digest('hex').slice(20);
    }
};

exports.download = download;
