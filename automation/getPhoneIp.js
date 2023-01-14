const puppeteer = require('puppeteer');
const schedule = require('node-schedule');

function startSchedule() {
    schedule.scheduleJob('*/1 * * * *', function () {

        getPhoneIp()

    });
}

async function getPhoneIp() {

    const chromeOptions = {
        headless: true,
        //executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        //ignoreHTTPSErrors: true,
        //args: ['--start-maximized']
    };

    const browser = await puppeteer.launch(chromeOptions);

    try {

        const page = (await browser.pages())[0];


        await page.goto('http://192.168.1.1', { waitUntil: 'load', timeout: 0 });


        await page.waitForSelector('input[name=Frm_Username]');
        await page.$eval('#Frm_Username', el => el.value = '1234');
        await page.$eval('#Frm_Password', el => el.value = 'Slevin08Kelevra');

        await page.$eval('input[id=LoginId]', login => login.click());

        await page.waitForSelector('#home_devitem');
        await page.waitForSelector('#template_home_devitem_0');

        const data = await page.evaluate(() => {
            const divs = Array.from(document.querySelectorAll('#home_devitem div'))
            return divs.map(div => Array.from(div.querySelectorAll('span')).map(span => span.innerText))
        });

        const phnoeRow = data.find(row => row[0] == 'realme-8');

        if (!phnoeRow) {
            console.log("***********************");
            console.log("***Phone out of home***");
            console.log("***********************");
        } else {
            console.log(data.find(row => row[0] == 'realme-8')[2]);
        }

        console.log("done, closing browser");

        await page.$eval('div[id=LogOffLnk]', logout => logout.click());

    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }

}

startSchedule();