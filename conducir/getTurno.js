//const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const UserAgent = require('user-agents');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const request = require('request-promise-native');
const poll = require('promise-poller').default;
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';

const siteDetails = {
    sitekey: '6LeVHLQUAAAAAIMSqhSMmiDP8Q9oXbplm-5Cdgac',
    pageurl: 'https://sedeclave.dgt.gob.es/WEB_NCIT_CONSULTA/solicitarCita.faces'
  }

async function get() {

    const chromeOptions = {
        headless: true,
        defaultViewport: null,
        slowMo: 10,
    };

    puppeteer.use(stealthPlugin());
    /* puppeteer.use(
        RecaptchaPlugin({
          provider: {
            id: '2captcha',
            token: '03AGdBq26PoOoJdkTsFcgCF9ggZQI8Y5eK8KG2HXYFjqCbHPqpWZd7APvCWHM76yGBYBPFQwayU22c8hm20ikEE5fz8u_Lc9_9c3_ylByboNg6GZNrIkxH3MBWd4amU7qxX6215AE3QWqcRX8-UJxzKw8FhkSerWiGFgSKZPvBQfl23RBrplTCZlC9_dQmDsALodYC7Wd1vV24uI391kX2GCF29WfYz-AIwI3CsQgTh1vDdy7jYzzlAZf8o5Jce8iFc0zPSRAmgJqf2_XyP-4rSICkRoO86BMKpsme5PQlck0BoNd4ehn-uJ1MRwtwpAYGPkI2nMPdjgahX2LZEBDvfq5AYl8ryZp2rl6reidX_cps5BmnA55gefVus8IOwjdlfJOCATp9mObDgeZxNW5nrnk_cpPanXap2HKQB3uaZMvPEu34S6Xx-qRtAMD6HhRtEOqlhT6Zv2VX' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
          },
          visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
        })
      );  */
    const browser = await puppeteer.launch(chromeOptions);
    try {

        const page = await browser.newPage();
        //await page.setUserAgent(userAgent.toString());
        page.on('console', consoleObj => console.log(consoleObj.text()));
        await page.setViewport({
            width: 1920 + Math.floor(Math.random() * 100),
            height: 3000 + Math.floor(Math.random() * 100),
            deviceScaleFactor: 1,
            hasTouch: false,
            isLandscape: false,
            isMobile: false,
        });
        const userAgent = new UserAgent();
        const UA = userAgent.toString() || USER_AGENT;
        await page.setUserAgent(UA);
        await page.setJavaScriptEnabled(true);
        await page.setDefaultNavigationTimeout(100000);


        await page.goto('https://sedeclave.dgt.gob.es/WEB_NCIT_CONSULTA/solicitarCita.faces', { waitUntil: 'load', timeout: 0 });
        /* await page.solveRecaptchas();
        await Promise.all([
            page.waitForNavigation(),
            page.click(`#recaptcha-demo-submit`)
          ]) */

        await page.select('select[name="publicacionesForm:oficina"]', '27');
        await page.waitForNavigation();

        await page.select('select[name="publicacionesForm:tipoTramite"]', '3');
        await page.waitForTimeout(2000);

        await page.select('select[name="publicacionesForm:pais"]', '22');
        await page.waitForTimeout(2000);

        console.log('start');
        //const requestId = await initiateCaptchaRequest('6LeVHLQUAAAAAIMSqhSMmiDP8Q9oXbplm-5Cdgac');
        //console.log('2=' + requestId);
        const response = '03AGdBq27ht_AR1gDaGw_LK084N0YrBPbXeMiA0APHemw0tZeThU5dhXXcdgf9WJItVc_nXTgeQkXAt2SGIOC_J5nnABZZvyg-vg1MWZ5u93Ee8XbRc2hjDuSoUlNl0rgVoNyjHYqJt4s8Ls9gjkVDhR_fUUlDEmUcJPEIW2WMotkUvbFoHkQL4yZl5nDlc53dh4yRYM9-tpIMZK_aW9B9dbkmRYE3KkgbanGo5VhqEpeaXlBUGPfyfCk14PtGvkQbnkJKiKuGNd7JdPefFqFx18DEUgHcpnLMNuDUjo-oGwjtmyB39Em18efw7ns1NVM6cz4lyLHtwEbcXINXAPLFvdfLg7U0-QTSsPX3SUoLiZqj29bQFEOzX2xRCenkGfmPZX0Za4JeQ3Mnr7cTzifDks9SKgHVWdW_Zwvnkr7OgPgby2I0yG9uTccY2Ec0VXy3SCP_lNpicKfi';//await pollForRequestResults('6LeVHLQUAAAAAIMSqhSMmiDP8Q9oXbplm-5Cdgac', requestId);
        console.log('3=' + response);
        const js = `document.getElementById("g-recaptcha-response").innerHTML="${response}";`
        console.log('key=' + response);
        await page.evaluate(js);

        await page.click('input[name="publicacionesForm:j_id70"]', { delay: 10 });
        await page.waitForTimeout(2000);

        try {
            await page.waitForSelector('li.msgError');
            await page.$eval('li.msgError', function (li) {
                return li.innerText;
            }).then(function (result) {
                console.log(result);
            });
        } catch (err) {
            console.log("got it");
        }

        await page.screenshot({ path: 'first.png', fullPage: true })

    } catch (error) {
        throw error;
    } finally {
        await browser.close();
    }

}

get();

async function initiateCaptchaRequest(apiKey) {
    const formData = {
        method: 'solicitarCita',
        googlekey: siteDetails.sitekey,
        key: apiKey,
        pageurl: siteDetails.pageurl,
        json: 1
    };
    const response = await request.post('http://2captcha.com/in.php', { form: formData });
    return JSON.parse(response).request;
}

async function pollForRequestResults(
    key,
    id,
    retries = 30,
    interval = 1500,
    delay = 15000
) {
    await timeout(delay);
    return poll({
        taskFn: requestCaptchaResults(key, id),
        interval,
        retries
    });

}
function requestCaptchaResults(apiKey, requestId) {
    const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
    return async function () {
        return new Promise(async function (resolve, reject) {
            const rawResponse = await request.get(url);
            const resp = JSON.parse(rawResponse);
            if (resp.status === 0) return reject(resp.request);
            resolve(resp.request);
        });
    }
}

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))