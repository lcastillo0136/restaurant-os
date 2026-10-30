import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { classNames } from './utils';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, htmlFor, hint, error, required, children }: FormFieldProps) {
  const messageId = `${htmlFor}-message`;
  return (
    <div className={classNames('ros-field', error && 'has-error')}>
      <label htmlFor={htmlFor}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children}
      {(error || hint) && <small id={messageId} role={error ? 'alert' : undefined}>{error ?? hint}</small>}
    </div>
  );
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
}

export function TextField({ id: providedId, label, hint, error, required, className, ...props }: TextFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <FormField label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <input id={id} className={classNames('ros-input', className)} aria-invalid={Boolean(error)} aria-describedby={(error || hint) ? `${id}-message` : undefined} required={required} {...props} />
    </FormField>
  );
}

export interface SelectFieldOption { value: string; label: string; disabled?: boolean }
export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id?: string;
  label: string;
  options: SelectFieldOption[];
  hint?: string;
  error?: string;
}

export function SelectField({ id: providedId, label, options, hint, error, required, className, ...props }: SelectFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <FormField label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <select id={id} className={classNames('ros-select', className)} aria-invalid={Boolean(error)} aria-describedby={(error || hint) ? `${id}-message` : undefined} required={required} {...props}>
        {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
      </select>
    </FormField>
  );
}

export interface FormSectionProps { title: string; description?: string; children: ReactNode }
export function FormSection({ title, description, children }: FormSectionProps) {
  return <fieldset className="ros-form-section"><legend>{title}</legend>{description && <p>{description}</p>}<div className="ros-form-section__content">{children}</div></fieldset>;
}
