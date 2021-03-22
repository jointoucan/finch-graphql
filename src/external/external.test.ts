import gql from 'graphql-tag';
import { FinchMessageKey } from '../types';
import { isListeningOnDocument } from './isListeningOnDocument';
import { listenForDocumentQueries } from './listenForDocumentQueries';
import { queryApiFromDocument } from './queryApiFromDocument';
describe('external document messaging', () => {
  let unbindListener: () => void;
  let ogChrome = window.chrome;
  beforeAll(() => {
    window.chrome = undefined;
    Object.assign(browser.runtime, { id: 'foo' });
  });
  afterAll(() => {
    window.chrome = ogChrome;
  });
  afterEach(() => {
    if (unbindListener) {
      unbindListener();
    }
  });
  it('should fail to send if there is no listeners attached', async () => {
    await expect(
      queryApiFromDocument(`query test { foo }`, {}, { extensionId: 'foo' }),
    ).rejects.toMatchObject({
      message: 'Finch is not currently listening for messages',
    });
  });
  it('should send a message to the browser message if there is a listener', async () => {
    const query = gql`
      query test {
        foo
      }
    `;
    const variables = {};

    browser.runtime.sendMessage = jest.fn().mockResolvedValue({ data: null });
    unbindListener = listenForDocumentQueries();
    expect(isListeningOnDocument()).toBe(true);

    const resp = await queryApiFromDocument(query, variables, {
      extensionId: 'foo',
    });

    expect(browser.runtime.sendMessage).toBeCalledWith({
      query: query,
      variables: variables,
      type: FinchMessageKey.Generic,
      external: true,
    });
    expect(resp).toEqual({ data: null });
  });

  it('should timeout if the request does not respond', async () => {
    const query = gql`
      query test {
        foo
      }
    `;
    const variables = {};

    browser.runtime.sendMessage = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ data: null });
        }, 300);
      });
    });
    unbindListener = listenForDocumentQueries();
    expect(isListeningOnDocument()).toBe(true);

    await expect(
      queryApiFromDocument(query, variables, {
        timeout: 100,
        extensionId: 'foo',
      }),
    ).rejects.toMatchObject({
      message: 'Finch request has timed out.',
    });
  });
  it('should only respond with the correct response', async () => {
    const query = `
      query foo {
        foo
      }
    `;
    const variables = {};

    browser.runtime.sendMessage = jest.fn().mockImplementation(message => {
      // TODO: this should be an abstraction in FinchAPI that we can reuse.
      let operationName = undefined;
      const operationDef = message.query.definitions.find(
        def => def.kind === 'OperationDefinition',
      );
      if (operationDef && 'name' in operationDef) {
        operationName = operationDef?.name?.value ?? undefined;
      }
      // Wait for 500 ms
      if (operationName === 'foo') {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ data: { foo: 'bar' } });
          }, 500);
        });
      }
      return Promise.resolve({ data: null });
    });
    unbindListener = listenForDocumentQueries();
    expect(isListeningOnDocument()).toBe(true);

    const responses = await Promise.all([
      queryApiFromDocument(query, variables, { extensionId: 'foo' }),
      queryApiFromDocument(`query bar { foo }`, variables, {
        extensionId: 'foo',
      }),
      queryApiFromDocument(query, variables, { extensionId: 'foo' }),
    ]);

    expect(responses).toEqual([
      { data: { foo: 'bar' } },
      { data: null },
      { data: { foo: 'bar' } },
    ]);
  });
});
