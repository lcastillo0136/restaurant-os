import { FirstAdminProvisioningError } from './first-admin-provisioner.js';

/** Keeps driver/database failures from disclosing connection, SQL, or credentials. */
export function safeBootstrapErrorMessage(error: unknown): string {
  if (error instanceof FirstAdminProvisioningError) return error.message;
  return 'El bootstrap no pudo completarse por un error interno. No se muestran detalles sensibles.';
}
