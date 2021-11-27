/**
 * @name Duck Duck Go search
 */


// puppeteer crawler
const puppeteer = require('puppeteer');
// file system
const fs = require('fs');
const file_path = './my_data.json'
async function writeFile(filename, writedata) {
    try {
        await fs.promises.writeFile(filename, JSON.stringify(writedata, null, 4), 'utf8');
        console.log('data is written successfully in the file')
    } catch (err) {
        console.log('not able to write data in the file ')
    }
}

// const tf = require('@tensorflow/tfjs-node');
// const toxicity = require('@tensorflow-models/toxicity');
// const use = require('@tensorflow-models/universal-sentence-encoder');

// // Load wink-nlp package  & helpers.
// const winkNLP = require('wink-nlp');
// // Load "its" helper to extract item properties.
// const its = require('wink-nlp/src/its.js');
// // Load "as" reducer helper to reduce a collection.
// const as = require('wink-nlp/src/as.js');
// // Load english language model — light version.
// const model = require('wink-eng-lite-model');
// // Instantiate winkNLP.
// const nlp = winkNLP(model);
// // Require the BM25 Vectorizer.
// const BM25Vectorizer = require('wink-nlp/utilities/bm25-vectorizer');
// // Instantiate a vectorizer with the default configuration — no input config
// // parameter indicates use default.
// const bm25 = BM25Vectorizer();



// const keyword = 'cheating mspy';
const keyword = 'https://track.mspy.click/aff_c';

const stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"];

function remove_stopwords(str) {
    res = []
    words = str.split(' ')
    for (i = 0; i < words.length; i++) {
        word_clean = words[i].split(".").join("")
        if (!stopwords.includes(word_clean)) {
            res.push(word_clean)
        }
    }
    return (res.join(' '))
}

(async () => {
    // initiate the browser
    const browser = await puppeteer.launch({
        headless: false
    })
    const page = await browser.newPage()

    // search and store the result
    await page.goto('https://duckduckgo.com/', {
        waitUntil: 'networkidle2'
    })
    await page.type('#search_form_input_homepage', keyword)
    await page.click('#search_button_homepage')
    await page.waitForSelector('.result')
    // for (let i = 0; i < 1; i++) {
    //     await Promise.all([
    //         await page.click('.result--more'),
    //         await page.waitForNavigation(),
    //         await page.waitForSelector('.result--more')
    //     ])
    //     // await page.click('.result--more')
    //     // console.log("click #" + i)
    //     // await page.waitForSelector('.result--more')
    // }
    await page.click('.result--more')
    await page.waitForSelector('.result--more').then(() => {console.log('result more waited')})
    

    

    let res = await page.$$eval('.result:not(.result--more)', el => el.map(ele => ({
        'title': ele.querySelector('.js-result-title').innerText,
        'link': ele.querySelector('.js-result-title-link').getAttribute('href'),
        'desc': ele.querySelector('.js-result-snippet').innerText
    })))
    // res = res.slice(0, 2) // temp
    console.log(res[0].desc)
    console.log(remove_stopwords(res[0].desc))

    writeFile(file_path, res)

    // Load the model.
    // use.load().then(model => {
    //     // Embed an array of sentences.
    //     const sentences = res.map((it)=>{
    //         return it.desc
    //     });
    //     model.embed(sentences).then(embeddings => {
    //     // `embeddings` is a 2D tensor consisting of the 512-dimensional embeddings for each sentence.
    //     // So in this example `embeddings` has the shape [2, 512].
    //     embeddings.print(true /* verbose */);
    //     let embArr = tf.split(embeddings, embeddings.shape[0], 0).map( it => it.reshape([embeddings.shape[1]]));
    //     // console.log(embArr)
    //     let rawData = []
    //     for (let i = 0; i < embArr.length; i++) {
    //         for (let j = 0; j < em
    // bArr.length; j++) {
    //             let a = embArr[i];
    //             let b = embArr[j];
    //             rawData.push(a.dot(b).div(a.norm().mul(b.norm())).dataSync()[0])
    //         }
    //     }
    //     let simMatrix = tf.tensor2d(rawData, [embArr.length, embArr.length])
    //     simMatrix.print()
    //     });
    // });

    // go to each link 
    //  for (let i = 0; i < res.length; i++) {
    //      let ele = res[i]
    //      await page.goto(ele.link, {waitUntil: 'load', timeout: 0})
    //      await page.waitForSelector('body')
    //      const body = await page.$eval('body', ele => ele.innerText.replace(/\s{2,}|\r\n|\r|\n/g," "))
    //      let p = await page.$$eval('p', ele => ele.map(el => el.innerText.replace(/\s{2,}|\r\n|\r|\n/g," ")));
    //      p = p.join(' ')
    //      ele.body = p
    //      let doc = nlp.readDoc(p)
    //      ele.doc = doc
    //  }


    // bm25 learning
    // res.forEach((ele) => {
    //     bm25.learn(ele.doc.tokens()
    //         .filter(
    //             (t) => !t.out(its.stopWordFlag) &&
    //             (t.out(its.type) === 'word'))
    //         .out(its.normal))
    // })

    // console.log(bm25.doc(0).out(its.tf).sort((a, b) => (a[1] > b[1])).slice(0, 100))
    // for (let i = 0; i < res.length; i++) {
    //     console.log(res[i].title)
    //     console.log(res[i].link)
    //     console.log(res[i].desc)
    //     // console.log(bm25.doc(i).out(its.tf).slice(0, 20))  // array is already sorted, no need
    //     console.log(res[i].doc.tokens()
    //         .filter(
    //             (t) => !t.out(its.stopWordFlag) &&
    //             (t.out(its.type) === 'word'))
    //         .out(its.normal, as.bow).sort((a, b) => (a[1] > b[1])).slice(0, 20)
    //     )
    // }


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