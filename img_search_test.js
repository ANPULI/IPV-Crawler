/**
 * @name Duck Duck Go search
 * @abstract Image reverse search test
 */
 
const puppeteer = require('puppeteer');

const keyword = ' https://track.mspy.click/aff_c';
// const keyword = 'mspy';
 
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

    console.log(res)

    
    // go to each link 
    // for (let i = 0; i < res.length; i++) {
    //     let ele = res[i]
    //     await page.goto(ele.link, {waitUntil: 'networkidle2'})
    //     await page.waitForSelector('body')
    //     const body = await page.$eval('body', ele => ele.innerText.replace(/\s{2,}|\r\n|\r|\n/g," "))
    //     ele.body = body
    //     let doc = nlp.readDoc(body)
    //     ele.doc = doc
    // }

    
    // res.forEach((ele) => {
    //     bm25.learn(ele.doc.tokens().out(its.normal))
    // })

    // console.log(bm25.out(its.tf))

    // toxicity.load(0.9).then(model => {
    //     // Now you can use the `model` object to label sentences. 
    //     model.classify(res[0].doc.out()).then(predictions => {
    //         predictions.forEach(element => {
    //             console.log(element.label, element.results)
    //         });
    //     });
    // });

    await browser.close()
     
 })()
 