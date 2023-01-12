const puppeteer = require('puppeteer-extra');
stealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0 Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0';


puppeteer.use(stealthPlugin());

async function get() {

    const chromeOptions = {
        headless: false,
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        ignoreHTTPSErrors: true,
        args: ['--start-maximized']
    };

    const browser = await puppeteer.launch(chromeOptions);

    try {

        const page = (await browser.pages())[0];
        const userAgent = new UserAgent();
        const UA = USER_AGENT;
        await page.setUserAgent(UA);
        await page.setJavaScriptEnabled(true);

        await page.goto('http://192.168.1.1', { waitUntil: 'load', timeout: 0 });


        await page.waitForSelector('input[name=Frm_Username]');
        await page.$eval('#Frm_Username', el => el.value = '1234');
        await page.$eval('#Frm_Password', el => el.value = 'Slevin08Kelevra');

        await page.$eval('input[id=LoginId]', el => el.click());

        await page.waitForSelector('#home_devitem');
        await page.waitForSelector('#template_home_devitem_0');

        const data = await page.evaluate(() => {
            const divs = Array.from(document.querySelectorAll('#home_devitem div'))
            return divs.map(div => Array.from(div.querySelectorAll('span')).map(span => span.innerText))
        });

        console.log(data.find(row => row[0] == 'realme-8')?.[2]);

        console.log("done");



    } catch (error) {
        throw error;
    } finally {
        //await browser.close();
    }

}

get();