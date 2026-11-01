import { StringDecoder } from 'node:string_decoder';
import { FirstAdminProvisioningError } from './first-admin-provisioner.js';

export type InteractiveInput = Readonly<{
  isTTY?: boolean;
  on(event: 'data' | 'error', listener: (value: Buffer | Error) => void): unknown;
  off(event: 'data' | 'error', listener: (value: Buffer | Error) => void): unknown;
  resume(): unknown;
  setRawMode(enabled: boolean): unknown;
}>;

export type InteractiveOutput = Readonly<{
  isTTY?: boolean;
  write(value: string): unknown;
}>;

export function assertInteractiveTerminal(input: InteractiveInput, output: InteractiveOutput): void {
  if (!input.isTTY || !output.isTTY) {
    throw new FirstAdminProvisioningError('El bootstrap exige una terminal interactiva; no acepta secretos redirigidos.');
  }
}

function removeLastCharacter(value: string): string {
  return [...value].slice(0, -1).join('');
}

/** Reads a secret in raw mode. Input is never echoed and raw mode is always restored. */
export function readHiddenLine(input: InteractiveInput, output: InteractiveOutput, prompt: string): Promise<string> {
  assertInteractiveTerminal(input, output);
  output.write(prompt);

  return new Promise((resolve, reject) => {
    const decoder = new StringDecoder('utf8');
    let value = '';
    let settled = false;
    let rawModeEnabled = false;

    const restore = (): void => {
      if (rawModeEnabled) {
        rawModeEnabled = false;
        input.setRawMode(false);
      }
    };
    const cleanup = (): void => {
      input.off('data', onData);
      input.off('error', onError);
      restore();
    };
    const complete = (): void => {
      if (settled) return;
      settled = true;
      cleanup();
      output.write('\n');
      resolve(value);
    };
    const cancel = (): void => {
      if (settled) return;
      settled = true;
      cleanup();
      output.write('\n');
      reject(new FirstAdminProvisioningError('Bootstrap cancelado por el operador.'));
    };
    const fail = (): void => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('No fue posible leer la entrada interactiva.'));
    };
    const onError = (): void => fail();
    const onData = (chunk: Buffer | Error): void => {
      if (chunk instanceof Error || settled) return fail();
      const characters = decoder.write(chunk);
      for (const character of characters) {
        if (character === '\r' || character === '\n') return complete();
        if (character === '\u0003') return cancel();
        if (character === '\u0008' || character === '\u007f') {
          value = removeLastCharacter(value);
          continue;
        }
        value += character;
      }
    };

    input.on('data', onData);
    input.on('error', onError);
    try {
      input.setRawMode(true);
      rawModeEnabled = true;
      input.resume();
    } catch {
      fail();
    }
  });
}
