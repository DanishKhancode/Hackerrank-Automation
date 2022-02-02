// node Hakker_Rank.js --url=https://www.hackerrank.com --config=config.json

let minimist = require("minimist");
let puppeteer = require("puppeteer");
let fs = require("fs");
let args = minimist(process.argv);
let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);
async function run() {
    let browser = await puppeteer.launch({  
        headless: false,defaultViewport: null,
        args: [
            '--start-maximized'
        ],
        defaultViewport: null
    });
    let pages = await browser.pages();
    let page = pages[0];
    await page.goto(args.url);
    //pahle page ka login click
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");
    //dusra page ka login click
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");
    //user id brtha ha 
    await page.waitForSelector("input[name = 'username']");
    await page.type("input[name = 'username']", configJSO.userid, { delay: 40 });
    //password
    await page.waitForSelector("input[name = 'password']");
    await page.type("input[name = 'password']", configJSO.password, { delay: 40 });
    await page.waitFor(2000);
    //login pa click  
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");
    // click on compet
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");   
    //click on manage contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");
    //find no. of pages
    await page.waitForSelector("a[data-attr1='Last']");
    let numPages = await page.$eval("a[data-attr1='Last']", function (atag) {
        let toPages = parseInt(atag.getAttribute("data-page"));
        return toPages;
    });
    for (let i = 1; i <= numPages; i++) {
       await handelAllContestPage(page,browser);
        if (i != numPages) {
            await page.waitForSelector("a[data-attr1='Right']");
            await page.click("a[data-attr1='Right']");
        }
    }
}
async function handelAllContestPage(page,browser) {
      //find all url
      await page.waitForSelector("a.backbone.block-center");
      let curls = await page.$$eval("a.backbone.block-center", function (atags) {
          let urls = [];
          for (let i = 0; i < atags.length; i++) {
              let url = atags[i].getAttribute("href");
              urls.push(url);
          }
          return urls;
      });
      for (let i = 0; i < curls.length; i++) {
          let ctab = await browser.newPage();    
          await handelContest(ctab, args.url + curls[i], configJSO.moderators);
          await ctab.close();
          await page.waitFor(3000);
      }   
}
    async function handelContest(ctab, fullCurl, moderators) {
        await ctab.bringToFront();
        await ctab.goto(fullCurl);
        await ctab.waitFor(3000);
        await ctab.waitForSelector("li[data-tab='moderators']");
        await ctab.click("li[data-tab='moderators']");
        await ctab.waitForSelector("#moderator");
        await ctab.type("#moderator", moderators, { delay: 200 });
        await ctab.keyboard.press("Enter");   
}
run(); 