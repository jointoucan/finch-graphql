import { FinchMessage } from '@finch-graphql/types';

/**
 * addMessageListener adds a message event handler
 * chrome apis need to return true the call sendResponse
 * https://developer.chrome.com/docs/extensions/mv2/messaging/#simple
 * @param handler the event handler
 * @param options some options to configure the message passing
 */
export const addMessageListener = (
  handler: (
    message: FinchMessage,
    sender: browser.runtime.MessageSender | chrome.runtime.MessageSender,
  ) => Promise<unknown>,
  options: { messageKey: string },
) => {
  if (typeof chrome === 'object') {
    chrome.runtime.onMessage.addListener(
      (
        message: { type?: string; [key: string]: any },
        sender: chrome.runtime.MessageSender,
        sendResponse: (payload: any) => void,
      ) => {
        if (message.type === options.messageKey) {
          handler(message, sender).then(response => sendResponse(response));
          return true;
        }
      },
    );
  } else if (typeof browser === 'object') {
    browser.runtime.onMessage.addListener(handler);
  }
};

/**
 * addExternalMessageListener adds an external message event handler
 * chrome apis need to return true the call sendResponse
 * @param handler the event handler
 * @param options some options to configure the message passing
 */
export const addExternalMessageListener = (
  handler: (
    message: FinchMessage,
    sender: browser.runtime.MessageSender | chrome.runtime.MessageSender,
  ) => Promise<unknown>,
  options: { messageKey: string },
) => {
  if (typeof chrome === 'object') {
    chrome.runtime.onMessageExternal.addListener(
      (
        message: { type?: string; [key: string]: any },
        sender: chrome.runtime.MessageSender,
        sendResponse: (payload: any) => void,
      ) => {
        if (message.type === options.messageKey) {
          handler(message, sender).then(response => sendResponse(response));
          return true;
        }
      },
    );
  } else if (typeof browser === 'object') {
    browser.runtime.onMessageExternal.addListener(handler);
  }
};

/**
 * sendMessage to the background process supports both external and
 * internal messaging
 */
export async function sendMessage<MessageResponse extends {}>(
  message: unknown,
): Promise<MessageResponse>;
export async function sendMessage<MessageResponse extends {}>(
  extensionId: string,
  message: unknown,
): Promise<MessageResponse>;
export async function sendMessage<MessageResponse extends {}>(
  extensionId: string | unknown,
  message?: unknown,
): Promise<MessageResponse> {
  const args: [unknown] | [string, unknown] = [extensionId];
  if (typeof message === 'object') {
    args.push(message);
  }

  if (typeof chrome === 'object') {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(...args, (resp: MessageResponse) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        }
        resolve(resp);
      });
    });
  }

  if (typeof browser === 'object') {
    return browser.runtime.sendMessage(...args) as Promise<MessageResponse>;
  }

  return Promise.reject(
    new Error(
      'Cannot send message to extension, this browser is not supported',
    ),
  );
}

/**
 * getExtensionId is a method to get the current extension id.
 * @returns string
 */
export const getExtensionId = () => {
  if (typeof chrome !== 'undefined') {
    return chrome.runtime.id;
  }
  return browser.runtime.id;
};

/**
 * onConnect is a proxy for port connection listeners
 */
export const onConnect = (
  callback: (port: browser.runtime.Port | chrome.runtime.Port) => void,
) => {
  try {
    if (
      typeof chrome !== 'undefined' &&
      typeof chrome.runtime.onConnect !== 'undefined'
    ) {
      return chrome.runtime.onConnect.addListener(callback);
    }
    return browser.runtime.onConnect.addListener(callback);
  } catch (e) {
    console.warn(`Unable to listen to external port connections:`, e.message);
  }
};

/**
 * removeConnectListener is a proxy for port connection listeners
 */
export const removeConnectListener = (
  callback: (port: browser.runtime.Port | chrome.runtime.Port) => void,
) => {
  try {
    if (
      typeof chrome !== 'undefined' &&
      typeof chrome.runtime.onConnect !== 'undefined'
    ) {
      return chrome.runtime.onConnect.removeListener(callback);
    }
    return browser.runtime.onConnect.removeListener(callback);
  } catch (e) {
    console.warn(
      `Unable to remove listener to external port connections:`,
      e.message,
    );
  }
};

type ConnectInfo = chrome.runtime.ConnectInfo;

export function connectPort({
  extensionId,
  connectInfo,
}: {
  extensionId?: string;
  connectInfo?: ConnectInfo;
}): browser.runtime.Port | chrome.runtime.Port {
  let args: [string, ConnectInfo | undefined] | [ConnectInfo | undefined];
  if (typeof extensionId === 'string') {
    args = [extensionId, connectInfo];
  } else {
    args = [connectInfo];
  }
  try {
    if (typeof chrome !== 'undefined') {
      return chrome.runtime.connect.apply(chrome.runtime, args);
    }
    return browser.runtime.connect.apply(browser.runtime, args);
  } catch (e) {
    console.warn(`Unable to connect to port:`, e.message);
  }
}

/**
 * onConnectExternal is a proxy for external port connection listeners
 */
export const onConnectExternal = (
  callback: (port: browser.runtime.Port | chrome.runtime.Port) => void,
) => {
  try {
    if (
      typeof chrome !== 'undefined' &&
      typeof chrome.runtime.onConnectExternal !== 'undefined'
    ) {
      return chrome.runtime.onConnectExternal.addListener(callback);
    }
    return browser.runtime.onConnectExternal.addListener(callback);
  } catch (e) {
    console.warn(`Unable to listen to external port connections:`, e.message);
  }
};

/**
 * removeConnectExternalListener is a proxy for external port connection listeners
 */
export const removeConnectExternalListener = (
  callback: (port: browser.runtime.Port | chrome.runtime.Port) => void,
) => {
  try {
    if (
      typeof chrome !== 'undefined' &&
      typeof chrome.runtime.onConnectExternal !== 'undefined'
    ) {
      return chrome.runtime.onConnectExternal.removeListener(callback);
    }
    return browser.runtime.onConnectExternal.removeListener(callback);
  } catch (e) {
    console.warn(
      `Unable to remove listener to external port connections:`,
      e.message,
    );
  }
};
