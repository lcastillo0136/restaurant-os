import assert from 'node:assert/strict';
import test from 'node:test';
import { PasswordService } from '../../dist/auth/password.service.js';

const testProfile = { memory: 8192, passes: 1, parallelism: 1, tagLength: 32 };

test('usa Argon2id y verifica correctamente la contraseña sin conservar texto plano', async () => {
  const passwords = new PasswordService(testProfile);
  const password = 'long passphrase for test only';
  const hash = await passwords.hash(password);

  assert.match(hash, /^\$argon2id\$v=19\$m=8192,t=1,p=1\$/);
  assert.equal(hash.includes(password), false);
  assert.equal(await passwords.verify(password, hash), true);
  assert.equal(await passwords.verify('incorrect passphrase', hash), false);
  assert.equal(await passwords.verify(password, undefined), false);
});
