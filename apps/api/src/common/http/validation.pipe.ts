import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { ValidationDetail } from './api-error.js';

function collectValidationDetails(errors: ValidationError[], parent = ''): ValidationDetail[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const current = error.constraints ? [{ field, constraints: Object.values(error.constraints) }] : [];
    return [...current, ...collectValidationDetails(error.children ?? [], field)];
  });
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: false },
    validationError: { target: false, value: false },
    exceptionFactory: (errors) => new BadRequestException({
      code: 'VALIDATION_FAILED',
      message: 'La solicitud no cumple las reglas de validación.',
      details: collectValidationDetails(errors),
    }),
  });
}
