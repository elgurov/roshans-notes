import { useState } from 'react';
import { Link } from 'react-router-dom';

import FormField from '../FormField/FormField';
import HeroPicker from '../HeroPicker/HeroPicker';
import { OUTCOME_OPTIONS } from '../../utils/heroAttrs';
import { validateLength, validateSelect } from '../../utils/validators';
import './NoteForm.css';

const EMPTY = { title: '', hero: null, story: '', outcome: '', opinion: '' };
const FIELDS = Object.keys(EMPTY);

function validate(v) {
  return {
    title: validateLength('Название', v.title, 3, 60),
    hero: v.hero ? '' : 'Выберите героя из списка',
    story: validateLength('Что я видел', v.story, 20, 800),
    outcome: validateSelect('Чем закончилось', v.outcome),
    opinion: validateLength('Моё мнение', v.opinion, 10, 500),
  };
}

/*
  Заметка — показания свидетеля: какой герой что делал с Рошаном,
  чем это кончилось и что свидетель об этом думает.

  Props:
    initialValues — значения для редактирования (по умолчанию пустая форма)
    submitLabel   — текст кнопки отправки
    onSubmit      — получает проверенные значения формы
    extraActions  — доп. кнопки справа (например, «Удалить»)
*/
export default function NoteForm({
  initialValues = EMPTY,
  submitLabel,
  onSubmit,
  extraActions,
}) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');

  const errors = validate(values);
  const showError = (name) => (touched[name] ? errors[name] : '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setSubmitError('');
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleHeroChange = (hero) => {
    setValues((prev) => ({ ...prev, hero }));
    setSubmitError('');
  };

  const handleHeroBlur = () => {
    setTouched((prev) => ({ ...prev, hero: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])));

    if (Object.values(errors).some(Boolean)) return;

    try {
      onSubmit(values);
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const common = { onChange: handleChange, onBlur: handleBlur };

  return (
    <form className="note-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <p className="note-form__alert" role="alert">
          {submitError}
        </p>
      )}

      <FormField
        id="title"
        label="Название"
        placeholder="Например: Как Антимаг ограбил моё логово"
        value={values.title}
        error={showError('title')}
        {...common}
      />

      <HeroPicker
        id="hero"
        label="Какого героя вы видели"
        value={values.hero}
        onChange={handleHeroChange}
        onBlur={handleHeroBlur}
        error={showError('hero')}
      />

      <FormField
        id="story"
        as="textarea"
        rows={6}
        label="Что я видел"
        hint="Где и когда это было, что герой делал с Рошаном"
        placeholder="Например: На 25-й минуте Антимаг зашёл в яму один. Я видел, как он бил Рошана без остановки, пока тот не рухнул…"
        value={values.story}
        error={showError('story')}
        {...common}
      />

      <FormField
        id="outcome"
        as="select"
        label="Чем закончилось"
        value={values.outcome}
        error={showError('outcome')}
        {...common}
      >
        <option value="">Выберите…</option>
        {OUTCOME_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </FormField>

      <FormField
        id="opinion"
        as="textarea"
        rows={4}
        label="Моё мнение"
        hint="Что вы об этом думаете: смело, глупо, красиво?"
        placeholder="Например: Смело, но рискованно: появись тут вражеская команда, он бы потерял всё."
        value={values.opinion}
        error={showError('opinion')}
        {...common}
      />

      <div className="note-form__actions">
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
        <Link to="/dashboard" className="btn btn--ghost">
          Отмена
        </Link>
        {extraActions && (
          <span className="note-form__extra">{extraActions}</span>
        )}
      </div>
    </form>
  );
}
