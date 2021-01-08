const commander = require('commander');

commander
    .option('--refresh-page', 'just refresh the page', false)
    .option('--update-nginxconfig', 'just update nginx config', false);;

module.exports = function parseArgv(argv) {
    commander.parse(argv);
    const { refreshPage, updateNginxconfig} = commander.opts();

    return {
        refreshPage,
        updateNginxconfig
    };
};
