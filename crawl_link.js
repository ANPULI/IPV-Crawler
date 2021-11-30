/**
 * @name Duck Duck Go search
 */


// puppeteer crawler
const puppeteer = require('puppeteer');
// const keyword = 'mspy';
// const file_path = './result/' + keyword.replace(/[\p{P}\p{S}]/gu, '').replace(/  +/g, ' ') + '.json'  // https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
// const keyword = 'https://track.mspy.click/aff_c';
// const file_path = './aff_c.json'
// const keyword = 'top mobile app';
// const file_path = './app.json'
const NPages = 4
// file system
const fs = require('fs');
const keywords = require('./keywords')

async function writeFile(filename, writedata) {
    try {
        await fs.promises.writeFile(filename, JSON.stringify(writedata, null, 4), 'utf8');
        console.log('data is written successfully in the file: ' + filename)
    } catch (err) {
        console.log('not able to write data in the file ')
    }
}


(async () => {
    // initiate the browser
    const browser = await puppeteer.launch({
        headless: false
    })
    const page = await browser.newPage()

    for (let idx = 0; idx < keywords.length; idx++) {

        let keyword = keywords[idx]

        let file_path = './result/' + keyword.replace(/[\p{P}\p{S}]/gu, '').replace(/  +/g, ' ') + '.json'  // https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
        console.log(`crawling starts for ${keyword} ${idx+1} / ${keywords.length}`)

        // search and store the result
        await page.goto('https://duckduckgo.com/', {
            waitUntil: 'networkidle2'
        })
        await page.type('#search_form_input_homepage', keyword)
        await page.click('#search_button_homepage')
        await page.waitForSelector('.result')

        // load n more pages
        for (let i = 0; i < NPages; i++) {
            try {
                const [response] = await Promise.all([
                    page.click('.result--more'),
                    page.waitForNetworkIdle({timeout: 10000}),
                    // page.waitForNavigation(),
                    page.waitForSelector('.result--more')
                ])
                console.log(`loading ${i+1} more pages`)
            } catch {
                console.log(`error occurred at ${keyword} #${i}`)
            }
        }

        let res = await page.$$eval('.result:not(.result--more):not(.result--sep)', el => el.map(ele => ({
            'title': ele.querySelector('.js-result-title').innerText,
            'link': ele.querySelector('.js-result-title-link').getAttribute('href'),
            'desc': ele.querySelector('.js-result-snippet').innerText
        })))

        console.log(`crawling ends for ${keyword}, #links: ${res.length}`)

        writeFile(file_path, res)
    };


    await browser.close()
})()