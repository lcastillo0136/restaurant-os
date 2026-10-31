import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export const officialReferenceHashes = new Map([
  ['01-admin-aprobado.png', 'b816382c0cfea84469885ea017c6ade6b7b161a6c831e9dfc4266e7dc6bb54c3'],
  ['02-tablet-aprobado.png', '36a87f4e58f83aea107278c431dc46f989a8c9cca772378591674644e5c357e7'],
  ['03-kds-aprobado.png', '076cd7b14599c003c9afb5521a1dbf0de5cdfc7505e7af1d09787075f9196fdd'],
  ['04-pos-aprobado.png', '0d326b5789506961793faa867b0138439eb26ade6cddfb69b426f038351a3c0e'],
]);

export function verifyOfficialReferences(root, reviewPackage) {
  const directory = resolve(root, 'design', 'reference');
  const pngFiles = existsSync(directory)
    ? readdirSync(directory).filter((name) => name.toLowerCase().endsWith('.png'))
    : [];

  if (reviewPackage) {
    if (pngFiles.length > 0) {
      throw new Error(`El paquete redistribuible no debe incluir referencias PNG privadas: ${pngFiles.join(', ')}`);
    }
    return 'Referencias privadas ausentes por política de redistribución.';
  }

  if (pngFiles.length !== officialReferenceHashes.size) {
    throw new Error('El entorno local debe contener exactamente las cuatro referencias PNG oficiales.');
  }

  for (const [name, expected] of officialReferenceHashes) {
    const path = resolve(directory, name);
    if (!existsSync(path)) throw new Error(`Referencia privada local ausente: ${name}`);
    const actual = createHash('sha256').update(readFileSync(path)).digest('hex');
    if (actual !== expected) throw new Error(`Referencia oficial alterada: ${name}`);
  }
  return 'Cuatro referencias oficiales con SHA-256 local intacto.';
}
