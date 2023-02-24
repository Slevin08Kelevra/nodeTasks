const puppeteer = require('puppeteer-extra');
stealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0 Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0';


puppeteer.use(stealthPlugin());

async function get() {

    const chromeOptions = {
        headless: false,
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        args: ['--start-maximized']
    };

    const browser = await puppeteer.launch(chromeOptions);

    try {

        const page = (await browser.pages())[0];
        const userAgent = new UserAgent();
        const UA = USER_AGENT;
        await page.setUserAgent(UA);
        await page.setJavaScriptEnabled(true);

        await page.goto('https://webapps.vdi2.ford.com/Citrix/EDC2Web/', { waitUntil: 'load', timeout: 0 });

        /* await page.on("dialog", async dialog => {
            try {
                console.log(dialog.message());
             await dialog.accept();
            } catch (e) {}
           }); */

        /*  await page.waitForSelector('.messageBoxAction')
        await page.click('.messageBoxAction');
        await page.waitForTimeout(1000);  */

        

        var linkHandlers = await page.$x("//a[contains(text(), 'Detect Citrix Workspace app')]");

        if (linkHandlers.length > 0) {
            await linkHandlers[0].click();
        } else {
            throw new Error("Link not found");
        }

        
        
        await page.waitForSelector('.auth-choice-link');
        await page.click('.auth-choice-link');

        await page.waitForSelector('input[name=username]');
        await page.$eval('#username', el => el.value = 'PPAPARIN@ford.com');
        await page.$eval('#password', el => el.value = 'Charly08?Riess');

        var logon = await page.$x("//a[contains(text(), 'Log On')]");
        await logon[0].click();

       

    } catch (error) {
        throw error;
    } finally {
        //await browser.close();
    }

}

get();