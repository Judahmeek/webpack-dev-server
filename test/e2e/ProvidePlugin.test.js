'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/provide-plugin-config/webpack.config');
const runBrowser = require('../helpers/run-browser');

describe.skip('ProvidePlugin', () => {
  describe('inline', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        inline: true,
        watchOptions: {
          poll: true,
        },
      };
      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('on browser client', () => {
      it('should inject SockJS client implementation', async () => {
        const { page, browser } = await runBrowser();

        page.goto('http://localhost:9000/main');

        await page.waitForNavigation({ waitUntil: 'load' });

        const isCorrectClient = await page.evaluate(() => {
          return window.injectedClient === window.expectedClient;
        });

        expect(isCorrectClient).toBeTruthy();

        await browser.close();
      });
    });
  });

  describe('not inline', () => {
    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        inline: false,
        watchOptions: {
          poll: true,
        },
      };
      testServer.startAwaitingCompilation(config, options, done);
    });

    afterAll(testServer.close);

    describe('on browser client', () => {
      it('should not inject client implementation', async () => {
        const { page, browser } = runBrowser();

        page.goto('http://localhost:9000/main');
        await page.waitForNavigation({ waitUntil: 'load' });

        const isCorrectClient = await page.evaluate(() => {
          // eslint-disable-next-line no-undefined
          return window.injectedClient === undefined;
        });

        expect(isCorrectClient).toBeTruthy();

        await browser.close();
      });
    });
  });
});