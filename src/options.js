const commander = require('commander');

commander
    .option('-r, --refresh-page', 'just refresh the page', false);

module.exports = function parseArgv(argv) {
    commander.parse(argv);
    const opt = commander.opts();

    return {
        refreshPage: opt.refreshPage
    };
};
