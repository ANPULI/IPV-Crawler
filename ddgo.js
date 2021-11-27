/**
 * @name Duck Duck Go search
 */
const tf = require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');
const use = require('@tensorflow-models/universal-sentence-encoder');

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
// const { tf } = require('wink-nlp/src/its.js');
// Instantiate a vectorizer with the default configuration — no input config
// parameter indicates use default.
const bm25 = BM25Vectorizer();

const keyword = ' https://track.mspy.click/aff_c';

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

    // Load the model.
    use.load().then(model => {
        // Embed an array of sentences.
        const sentences = res.map((it)=>{
            return it.desc
        });
        model.embed(sentences).then(embeddings => {
        // `embeddings` is a 2D tensor consisting of the 512-dimensional embeddings for each sentence.
        // So in this example `embeddings` has the shape [2, 512].
        embeddings.print(true /* verbose */);
        let embArr = tf.split(embeddings, embeddings.shape[0], 0).map( it => it.reshape([embeddings.shape[1]]));
        // console.log(embArr)
        let rawData = []
        for (let i = 0; i < embArr.length; i++) {
            for (let j = 0; j < embArr.length; j++) {
                let a = embArr[i];
                let b = embArr[j];
                rawData.push(a.dot(b).div(a.norm().mul(b.norm())).dataSync()[0])
            }
        }
        let simMatrix = tf.tensor2d(rawData, [embArr.length, embArr.length])
        simMatrix.print()
        });
    });
    
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
