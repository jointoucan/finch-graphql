import { queryApi } from './client';
import gql from 'graphql-tag';
import { FinchMessageKey } from '../types';

describe('queryApi', () => {
  it('should send and message to the background script', async () => {
    const ogChrome = window.chrome;
    window.chrome = undefined;
    browser.runtime.sendMessage = jest.fn().mockResolvedValue({});
    await queryApi(`{ test }`, {});
    expect(browser.runtime.sendMessage).toBeCalled();
    window.chrome = ogChrome;
  });
  it('should send and message to the background script externally', async () => {
    const ogChrome = window.chrome;
    window.chrome = undefined;
    browser.runtime.sendMessage = jest.fn().mockResolvedValue({});
    const fooQuery = gql`
      query foo {
        test
      }
    `;
    await queryApi(fooQuery, {}, { id: 'foo' });
    expect(browser.runtime.sendMessage).toBeCalledWith('foo', {
      type: FinchMessageKey.Generic,
      query: fooQuery,
      variables: {},
    });
    window.chrome = ogChrome;
  });

  it('should send and message to the background script using chrome apis if available', async () => {
    const ogChrome = window.chrome;
    chrome.runtime.sendMessage = jest
      .fn()
      .mockImplementation((_message: unknown, callback: (resp: {}) => {}) => {
        callback({});
      });
    await queryApi(`{ test }`, {});
    expect(chrome.runtime.sendMessage).toBeCalled();
    window.chrome = ogChrome;
  });
});
