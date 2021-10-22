/**
 * @name Duck Duck Go search
 */

const keyword = ' https://track.mspy.click/aff_c'

const puppeteer = require('puppeteer');
// Load wink-nlp package  & helpers.
const winkNLP = require( 'wink-nlp' );
// Load "its" helper to extract item properties.
const its = require( 'wink-nlp/src/its.js' );
// Load "as" reducer helper to reduce a collection.
const as = require( 'wink-nlp/src/as.js' );
// Load english language model — light version.
const model = require( 'wink-eng-lite-model' );
// Instantiate winkNLP.
const nlp = winkNLP( model );
// Require the BM25 Vectorizer.
const BM25Vectorizer = require('wink-nlp/utilities/bm25-vectorizer');
// Instantiate a vectorizer with the default configuration — no input config
// parameter indicates use default.
const bm25 = BM25Vectorizer();

(async () => {
    // initiate the browser
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    // search and store the result
    await page.goto('https://duckduckgo.com/', { waitUntil: 'networkidle2' })
    await page.type('#search_form_input_homepage', keyword)
    await page.click('#search_button_homepage')
    await page.waitForSelector('.result')
    const res = await page.$$eval('.result:not(.result--more)', el => el.map(ele => ({
        'title': ele.querySelector('.js-result-title').innerText, 
        'link': ele.querySelector('.js-result-title-link').getAttribute('href'), 
        'desc': ele.querySelector('.js-result-snippet').innerText
    })))
    // console.log(res)

    // go to each link 
    for (let i = 0; i < res.length; i++) {
        let ele = res[i]
        await page.goto(ele.link, {waitUntil: 'networkidle2'})
        await page.waitForSelector('body')
        const body = await page.$eval('body', ele => ele.innerText.replace(/\s{2,}|\r\n|\r|\n/g," "))
        ele.body = body
        let doc = nlp.readDoc(body)
        ele.doc = doc
    }

    
    res.forEach((ele) => {
        bm25.learn(ele.doc.tokens().out(its.normal))
    })

    console.log(bm25.out(its.tf))

    await browser.close()
})()
