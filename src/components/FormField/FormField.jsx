import './FormField.css';

/*
  as = 'input' (по умолчанию) | 'textarea' | 'select'
  Для select варианты передаются как children: <option>…</option>
*/
export default function FormField({
  id,
  label,
  as = 'input',
  type = 'text',
  rows = 5,
  value,
  onChange,
  onBlur,
  error,
  hint,
  autoComplete,
  children,
}) {
  const Control = as;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint && !error ? hintId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  const controlProps = {
    id,
    name: id,
    value,
    onChange,
    onBlur,
    className: 'field__input',
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': describedBy,
  };

  if (as === 'input') {
    controlProps.type = type;
    controlProps.autoComplete = autoComplete;
  }
  if (as === 'textarea') {
    controlProps.rows = rows;
  }

  return (
    <div className={error ? 'field field--invalid' : 'field'}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <Control {...controlProps}>{children}</Control>
      {hint && !error && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
