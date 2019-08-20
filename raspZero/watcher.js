const puppeteer = require('puppeteer');
//const cron = require('node-cron');


//page.on('console', consoleObj => console.log(consoleObj.text()));
async function readMessages() {
    
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        //page.setUserAgent("Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)");
        page.on('console', consoleObj => console.log(consoleObj.text()));
        //await page.setViewport({ width: 1280, height: 800 })
        await page.goto('http://192.168.0.1/html/home.html', { waitUntil: 'load', timeout: 0 })
        //await page.waitForSelector('#username');

        /* await page.click('span.logout');
        await page.waitForSelector('#username');
        await page.type('#username', process.env.USER)
        await page.type('#password', process.env.PASS)
        await page.click('span.button_center > a')
        await page.waitFor(1000);  */

        //await page.waitForSelector('ul.pagination', { visible: true })
        //await page.click('button.btn.dropdown-toggle.dropdown-menu-right')
        //const tokenLink = await page.$$('li.dropdown-item > a')
        //tokenLink[0].click()

        await page.$eval('#logout_span', function (span) {
            return span.innerText;
        }).then(function (result) {
            console.log(result);
        });

        await page.click('#sms');
        await page.waitForSelector('span.button_right > span.button_center');
        await page.$eval('span.button_right > span.button_center', function (span) {
            return span.innerText;
        }).then(function (result) {
            console.log(result);
        });


    } catch (error) {
        throw error;
    } finally {
        //await page.screenshot({ path: 'extractor.png', fullPage: true })
        await browser.close();
    }

}

readMessages();