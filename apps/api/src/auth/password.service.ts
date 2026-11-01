import * as crypto from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { promisify } from 'node:util';

export type PasswordProfile = Readonly<{
  memory: number;
  passes: number;
  parallelism: number;
  tagLength: number;
}>;

export const passwordProfileToken = Symbol('password-profile');

type NodeArgon2 = (
  algorithm: 'argon2id',
  parameters: Readonly<{ message: Buffer; nonce: Buffer; memory: number; passes: number; parallelism: number; tagLength: number }>,
  callback: (error: Error | null, derivedKey: Buffer) => void,
) => void;

const argon2 = (crypto as unknown as { argon2: NodeArgon2 }).argon2;
const deriveArgon2 = promisify(argon2);

export const productionPasswordProfile: PasswordProfile = Object.freeze({
  memory: 65_536,
  passes: 3,
  parallelism: 4,
  tagLength: 32,
});

const encodedHash = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/;

function encode(value: Buffer): string {
  return value.toString('base64url');
}

@Injectable()
export class PasswordService {
  constructor(
    @Optional() @Inject(passwordProfileToken) private readonly profile: PasswordProfile = productionPasswordProfile,
  ) {}

  async hash(password: string): Promise<string> {
    const salt = crypto.randomBytes(16);
    const key = await deriveArgon2('argon2id', {
      message: Buffer.from(password, 'utf8'),
      nonce: salt,
      memory: this.profile.memory,
      passes: this.profile.passes,
      parallelism: this.profile.parallelism,
      tagLength: this.profile.tagLength,
    });
    return `$argon2id$v=19$m=${this.profile.memory},t=${this.profile.passes},p=${this.profile.parallelism}$${encode(salt)}$${encode(key)}`;
  }

  async verify(password: string, storedHash: string | null | undefined): Promise<boolean> {
    if (!storedHash) return false;
    const match = encodedHash.exec(storedHash);
    if (!match) return false;
    const [, memory, passes, parallelism, salt, expected] = match;
    const expectedKey = Buffer.from(expected, 'base64url');
    if (expectedKey.length === 0 || expectedKey.length > 128) return false;
    const key = await deriveArgon2('argon2id', {
      message: Buffer.from(password, 'utf8'),
      nonce: Buffer.from(salt, 'base64url'),
      memory: Number(memory),
      passes: Number(passes),
      parallelism: Number(parallelism),
      tagLength: expectedKey.length,
    });
    return key.length === expectedKey.length && crypto.timingSafeEqual(key, expectedKey);
  }
}
