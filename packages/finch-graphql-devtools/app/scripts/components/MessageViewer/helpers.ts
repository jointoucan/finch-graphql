import { FinchDevtoolsMessage } from './types';

export const formatJSON = <T extends {}>(json: T) => {
  return JSON.stringify(json, null, ' ');
};

export const safeParse = (json: string) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  }
};

export const getMessageTagInfo = (message: FinchDevtoolsMessage) => {
  const { response } = message;
  const hasErrors = response && response.errors && response.errors.length;

  let label = !response ? 'PENDING' : 'OK';
  if (hasErrors) {
    label = 'ERROR';
  }

  let color = !response ? 'yellow.200' : 'blue.200';
  if (hasErrors) {
    color = 'red.200';
  }
  return {
    label,
    color,
  };
};
