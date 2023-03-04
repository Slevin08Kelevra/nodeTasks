const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
var ping = require('ping');

function startSchedule() {
    schedule.scheduleJob('*/30 * * * * *', function () {
        console.log("pingin");
        getPhoneIp();
    });
}

async function pingPhone() {
    var hosts = ['192.168.1.132'];
    for (let host of hosts) {
        // WARNING: -i 2 argument may not work in other platform like windows
        let res = await ping.promise.probe(host, {
            timeout: 10,
            min_reply: 3,
        });
        //console.log(res.alive);
        var d = new Date();
        var time = d.toLocaleTimeString(); 
        if (res.alive){
            console.log(time + " - phone home");
        } else {
            console.log(time + " - *** PHONE GONE ALERT ***");
        }
        
    }
}

let browser;
async function getPhoneIp() {

    const chromeOptions = {
        headless: true,
        //executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        //ignoreHTTPSErrors: true,
        //args: ['--start-maximized']
    };

    if (browser == null){
        browser = await puppeteer.launch(chromeOptions);
    }
    console.log("Browser ready!!!")

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

        console.log("done, loging out");
        await page.click('#LogOffLnk');


    } catch (error) {
        console.error(error);
        await browser.close();
    } finally {
        //await browser.close();
    }

}

startSchedule();