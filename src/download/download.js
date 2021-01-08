const path = require('path');
const { promisify } = require('util');
const { trim } = require('lodash');
const { writeFile, mkdir, readFileSync } = require('fs');
const { createHash } = require('crypto');
const processExec = promisify(require('child_process').exec);
const assert = require('assert');
const { compileFile } = require('pug');
const otherDocs = require('../assets/other/docs.json');
const fsWriteFile = promisify(writeFile);
const downloadPath = path.resolve(__dirname, '../../.cached');
const rootPath = path.resolve(__dirname, '../../root');
const indexFile = path.resolve(rootPath, 'index.html');
const errorFile = path.resolve(downloadPath, 'error-msg.log');
const successFile = path.resolve(downloadPath, 'success-msg.log');
const sysErrorFile = path.resolve(downloadPath, 'error.log');
const downloadZshFile = path.resolve(__dirname, '../shell/download.zsh');
const compiler = compileFile(path.resolve(__dirname, 'template/index.pug'), {encoding: 'utf8'});
const staticFileReg = /(\/[^\/]+\.(?:html|xhtml|html))$/;
const maxProcessNum = 5;

/**
 * download
 * @param jsonArray 所有 *.json 文件的数组
 * @param refreshPage 如果为true说明只更新html文件
 */
async function download(jsonArr, refreshPage) {
    const asyncArr = [];
    const promiseExec = [];
    const exeSuccessMsgs = [];
    const exeErrorMsgs = [];
    const sysErrorMsgs = [];

    genDownloadPromiseFun({
        title: "app doc",
        dir: downloadPath,
        assets: jsonArr
    }, '');

    // generate html file after json configed
    fsWriteFile(indexFile, compiler({
        data: jsonArr.concat(otherDocs)
    }));

    if (refreshPage) {
        console.log('successfully refreshed index.html!');
        return;
    }

    /*
     * 执行wget,
     * 进程数，先放入与进程数相同的promise
     * 放入Promise.resolve(true) 是为了方便后面写.then
     */
    {
        let num = maxProcessNum;
        while(num > 0) {
            promiseExec.push(Promise.resolve(true));
            num--;
        }
    }

    /*
     * 再让asyncArr中的promise 函数一一放入
     *
     */
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
        const { dir, download_url, destDir } = json;
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

    /**
     *
     * 本来配置的就只有一层
     */
    function genDownloadPromiseFun(json, parentDir) {
        if (json.assets && json.assets.length > 0) {
            let currentDir = parentDir;
            /* 只有 目录需要dir，文件是shell 分析出来的 */
            if (json.dir) {
                currentDir = path.resolve(parentDir, json.dir);
            }

            //  递归生成目录与
            json.assets.forEach((json) => {
                genDownloadPromiseFun(json, currentDir);
            });

            return;
        }

        // 没有存在downloadUrl 又没有 dir
        if (!trim(json.download_url) && !trim(json.dir)) {
            console.error('a config err', JSON.stringify(json));
            throw new Error(
                '配置错误'
            );
            process.exit(1);

        }

        // 下载的位置
        json.dir = parentDir;

        // 为其生成hash路由
        json.destDir = path.resolve(json.dir.replace(downloadPath, rootPath), getFileName(json.download_url));
        json.link = json.destDir.replace(rootPath, '');

        if (staticFileReg.test(json.download_url)) {
            json.link = json.link + (json.download_url.match(staticFileReg))[1];
        }

        /*
         * 之所以bind是因为而未执行，也不是这里执行
         */
        asyncArr.push(handleDownload.bind(null, json));
    };

    function getFileName(str) {
        return createHash('sha1').update(str).digest('hex').slice(20);
    }
};

exports.download = download;
