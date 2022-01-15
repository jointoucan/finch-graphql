import { FinchConnectionType } from '../types';
import { FinchDevtools } from './FinchDevtools';
import { FinchPortConnection } from './FinchPortConnection';
import { FinchDevToolsMessageType } from './types';

describe('FinchDevtools', () => {
  it('should inherit the port connection interface', () => {
    expect(
      new FinchDevtools({
        connectionType: FinchConnectionType.Port,
      }),
    ).toBeInstanceOf(FinchPortConnection);
  });
  it('should allow for the pulling of connection info', async () => {
    const connection = new FinchDevtools({
      messagePortName: 'foo',
      connectionType: FinchConnectionType.Port,
    });

    expect(
      connection.messageListener(
        {
          id: 'foo',
          type: FinchDevToolsMessageType.RequestConnectionInfo,
        },
        {},
      ),
    ).resolves.toEqual({
      type: FinchDevToolsMessageType.ConnectionInfo,
      connectionType: FinchConnectionType.Port,
      messageKey: undefined,
      messagePortName: 'foo',
    });
  });
});
