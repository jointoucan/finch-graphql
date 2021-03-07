import { FinchMessage } from './types';

/* 
  NOTE: chrome apis need to return true the call sendResponse
  https://developer.chrome.com/docs/extensions/mv2/messaging/#simple
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
