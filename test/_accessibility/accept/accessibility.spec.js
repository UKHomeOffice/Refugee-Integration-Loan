/* eslint no-console: 0 */
const pa11y = require('pa11y');
const puppeteer = require('puppeteer');
const {readFile, writeFile} = require('fs/promises');
const settings = require('../../../hof.settings.json');
const path = require('path');
const fs = require('fs');

const testDir = `${process.cwd()}/test/_accessibility/tmp`;
const isDroneEnv = process.env.ENVIRONMENT === 'DRONE';

describe('the journey of an accessible accept application', async () => {
  let testApp;
  let initSession;
  let getUrl;
  let uris = [];
  const accessibilityResults = [];

  const SUBAPP = 'accept';
  const URI = '/contact';

  before(async () => {
    settings.routes.map(route => {
      if (route.includes('accept')) {
        const routeConfig = require(path.resolve(process.cwd(), route));
        uris = uris.concat(Object.keys(routeConfig.steps));
      }
    });

    testApp = getSupertestApp(SUBAPP);
    initSession = testApp.initSession;
    getUrl = testApp.getUrl;
  });

  async function content(pathValue) {
    try{
      const htmlText =  await readFile(pathValue, 'utf8');
      return htmlText;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  it('check accept accessibility issues', async () => {
    let browser;
    await initSession(URI);

    const exclusions = [
      '/confirm',
      '/complete-acceptance'
    ];

    console.log('uris: ', uris);
    await uris.reduce(async (previous, uri) => {
      await previous;

      if (exclusions.includes(uri)) {
        const result = {
          step: `/${SUBAPP}${uri}`,
          generic_message: 'MANUAL CHECK REQUIRED'
        };
        console.log(result);
        return Promise.resolve();
      }

      if (!isDroneEnv && !fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
      }

      const testHtmlFile = isDroneEnv ?
        `/root/.dockersock${uri}.html` :
        `${process.cwd()}/test/_accessibility/tmp${uri}.html`;

      const res = await getUrl(uri);

      try{
        await writeFile(testHtmlFile, res.text);
      } catch(err) {
        return console.log(err);
      }
      console.log('testHtmlFile: ', testHtmlFile);
      const testHtmlFileText = await content(testHtmlFile);
      const htmlCode = testHtmlFileText;
      if(isDroneEnv) {
        browser = await puppeteer.launch({headless: 'new',
          executablePath: '/usr/bin/google-chrome-stable',
          args: ['--no-sandbox', '--disable-setuid-sandbox']});
      } else {
        browser = await puppeteer.launch({headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox']});
      }
      const page = await browser.newPage();

      await page.setContent(htmlCode, {
        waitUntil: 'domcontentloaded'
      });

      const url = page.url();
      const a11y = await pa11y(url, {
        ignoreUrl: true,
        browser,
        page
      });
      a11y.step = `/${SUBAPP}${uri}`;
      accessibilityResults.push(a11y);
      await browser.close();
      await fs.unlink(testHtmlFile, (err, success) => {
        if (err) return console.log(err);
        return success;
      });
      return a11y;
    }, Promise.resolve());

    accessibilityResults.forEach(result => {
      result.issues.should.be.empty;
    });
  }).timeout(300000);
});
