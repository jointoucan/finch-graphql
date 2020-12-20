import { queryApi } from './client';
import browser from 'webextension-polyfill';

describe('queryApi', () => {
  it('should send and message to the background script', async () => {
    browser.runtime.sendMessage = jest.fn();
    await queryApi(`{ test }`, {});
    expect(browser.runtime.sendMessage).toBeCalled();
  });
})