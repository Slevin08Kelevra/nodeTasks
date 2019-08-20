const puppeteer = require('puppeteer');
const cron = require('node-cron');


//page.on('console', consoleObj => console.log(consoleObj.text()));
async function readMessages() {
    console.log("extremos token " + moment().format());
    const browser = await puppeteer.launch()
    extractionRequestIgnited = false;
    try {
        response.message = "Searching Token";
        const page = await browser.newPage()
        await page.setViewport({ width: 1280, height: 800 })
        await page.goto('https://web.furycloud.io/#/login', { waitUntil: 'load', timeout: 0 })
        await page.waitForSelector('[name="x-userName"]');
        await page.type('[name="x-userName"]', process.env.USER)
        await page.type('[name="x-password"]', process.env.PASS)
        await page.click('button.btn.btn-default.btn-primary.pull-right')

        //await page.waitFor(3000)
        await page.waitForSelector('ul.pagination', { visible: true })
        await page.click('button.btn.dropdown-toggle.dropdown-menu-right')
        //const tokenLink = await page.$$('li.dropdown-item > a')
        //tokenLink[0].click()

        await page.$eval('div.modal-content > div.modal-body > p', function (heading) {
            return heading.innerText;
        }).then(function (result) {
            response.token = result
            response.message = "Token Extracted!";
            response.error = "No Errors";
            validTo = moment().add(tokenValidTime, 'hour');
            extractionTime = moment();
        });
    } catch (error) {
        throw error;
    } finally {
        //await page.screenshot({ path: 'extractor.png', fullPage: true })
        await browser.close();
    }

}