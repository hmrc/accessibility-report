#!/usr/bin/env node
const pug = require('pug')
const sass = require('node-sass');

const preocessInputData = new Promise((res, rej) => {
    const stdin = process.openStdin();

    let data = "";

    stdin.on('data', function (chunk) {
        data += chunk;
    });

    stdin.on('end', function () {
        res(data)
    });
})

const prepareModel = original => {
    const out = {}
    let totalErrorCount = 0
    const vnuData = original.tools.find(x => x.tool === 'vnu')
    const axeData = original.tools.find(x => x.tool === 'axe')
    if (vnuData) {
        out.vnu = {
            total: vnuData.summary.errorCount,
            version: vnuData.version
        }
        totalErrorCount += out.vnu.total
    }
    if (axeData) {
        out.axe = {
            total: axeData.summary.errorCount,
            version: axeData.version
        }
        totalErrorCount += out.axe.total
    }
    return Object.assign({}, out, {original, totalErrorCount})
}

const includeSass = model => (new Promise((res, rej) => {
        sass.render({
                file: 'assets/style.scss'
            },
            (err, result) => {
                if (err) {
                    rej(err)
                } else {
                    res(result.css.toString().split('\n').join(''))
                }
            })
    }))
        .then(stylesheet => Object.assign(
            {},
            model,

            {
                assets: Object.assign(
                    {},
                    model.assets,
                    {stylesheet}
                )}))

preocessInputData
    .then(JSON.parse)
    .then(prepareModel)
    .then(includeSass)
    .then(model => pug.renderFile('template.pug', model))
    .then(console.log)
    .catch(e => {
        console.error('Something went wrong when preparing report')
        console.error('error was [%s] with message [%s]', e.name, e.message)
        console.error(e.stack)
        process.exit(1)
    })
