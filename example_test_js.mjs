import fetch from 'node-fetch';
import { remote } from 'webdriverio';
import * as EC from 'wdio-wait-for';
import { setOptions } from 'expect-webdriverio';

// Load environment variables
const dotenv = await import('dotenv');
dotenv.config();

// Set default wait time for all expect-webdriverio assertions
export const config = {
  before () {
      setOptions({ wait: 5000 })
  },
};

(async () => {
  
  let browser;

  try {
    // Read api key from env variable
    const api_key = process.env.API_KEY

    browser = await remote({
      logLevel: 'trace',
      protocol: 'https',
      hostname: 'appium-dev.headspin.io',
      port: 443,
      path: `/v0/${api_key}/wd/hub`,
      capabilities: {
        "headspin:initialScreenSize": {
          "width": 1920,
          "height": 1080
        },
        "headspin:selector": "device_skus:\"Chrome\"",
        "headspin:newCommandTimeout": 600
      }
    });

    // Test Steps:
    // 1 Click the 'add / remove elements' link to go to that page
    // 2 Assert that no elements have yet been added
    // 3 Add one new element, and assert that 1 elements have been added
    // 4 Add another new element, and assert that 2 elements have been added
    // 5 Delete a new element, and assert that 1 elements remain
    // 6 Delete the other new element, and assert that 0 elements remain
    // 7 Go back to the homepage

    await browser.url('https://the-internet.herokuapp.com');

    // Test
    await browser.$('a=Add/Remove Elements').click();
    let buttons = await browser.$$('.added-manually');
    console.assert(buttons.length === 0, 'Expected no elements to be added initially');

    await browser.$('button[onclick="addElement()"]').click();
    buttons = await browser.$$('.added-manually');
    console.assert(buttons.length === 1, 'Expected 1 element to be added');

    await browser.$('button[onclick="addElement()"]').click();
    buttons = await browser.$$('.added-manually');
    console.assert(buttons.length === 2, 'Expected 2 elements to be added');

    await buttons[1].click();
    buttons = await browser.$$('.added-manually');
    console.assert(buttons.length === 1, 'Expected 1 element to remain after deletion');

    await buttons[0].click();
    buttons = await browser.$$('.added-manually');
    console.assert(buttons.length === 0, 'Expected no elements to remain after all deletions');
    
    await browser.back();

  } finally {
    if (browser) {
      await browser.deleteSession();
    }
  }
});
