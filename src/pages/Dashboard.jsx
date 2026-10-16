import { useState } from 'react';
import { Link } from 'react-router-dom';

import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import { deleteNote, getNotesByOwner } from '../api/notesApi';
import { useAuth } from '../context/AuthContext';
import { ATTR_LABEL, OUTCOME_LABEL, heroImgUrl } from '../utils/heroAttrs';
import './Dashboard.css';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState(() => getNotesByOwner(user.id));
  const [noteToDelete, setNoteToDelete] = useState(null);

  const handleConfirmDelete = () => {
    try {
      deleteNote(noteToDelete.id, user.id);
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
    } finally {
      setNoteToDelete(null);
    }
  };

  return (
    <section className="dashboard">
      <header className="dashboard__profile">
        <div>
          <h1 className="dashboard__title">Личный кабинет</h1>
          <p className="dashboard__lead">
            Здесь твои записки: что герои творили у моего логова и что ты об этом думаешь.
          </p>
          <p className="dashboard__user">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </p>
        </div>
        <Link to="/dashboard/create" className="btn btn--primary">
          Новая заметка
        </Link>
      </header>

      <h2 className="dashboard__subtitle">
        Мои заметки <span className="dashboard__count">{notes.length}</span>
      </h2>

      {notes.length === 0 ? (
        <div className="dashboard__empty">
          <p>Ты пока ничего не записал. Расскажи, какой герой лез ко мне в логово и чем всё закончилось.</p>
          <Link to="/dashboard/create" className="btn btn--primary">
            Создать заметку
          </Link>
        </div>
      ) : (
        <ul className="note-list">
          {notes.map((note) => (
            <li key={note.id} className={`note-card note-card--${note.attr}`}>
              <div className="note-card__head">
                <h3 className="note-card__title">{note.title}</h3>
                <p className="note-card__hero">
                  {note.img && (
                    <img
                      className="note-card__icon"
                      src={heroImgUrl(note.img)}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="note-card__hero-name">
                    {note.hero || 'Герой не выбран'}
                  </span>
                  {note.attr && (
                    <span className="note-card__attr">
                      {ATTR_LABEL[note.attr] ?? note.attr}
                    </span>
                  )}
                </p>
              </div>

              {note.outcome && (
                <p className={`note-card__outcome note-card__outcome--${note.outcome}`}>
                  {OUTCOME_LABEL[note.outcome] ?? note.outcome}
                </p>
              )}

              {note.story && (
                <div className="note-card__section">
                  <h4 className="note-card__label">Что я видел</h4>
                  <p className="note-card__text">{note.story}</p>
                </div>
              )}

              {note.opinion && (
                <div className="note-card__section">
                  <h4 className="note-card__label">Моё мнение</h4>
                  <p className="note-card__text">{note.opinion}</p>
                </div>
              )}

              <div className="note-card__foot">
                <time className="note-card__date" dateTime={note.updatedAt}>
                  Изменено {formatDate(note.updatedAt)}
                </time>
                <div className="note-card__actions">
                  <Link to={`/dashboard/edit/${note.id}`} className="btn btn--ghost">
                    Изменить
                  </Link>
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={() => setNoteToDelete(note)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={Boolean(noteToDelete)}
        title="Удалить заметку?"
        message={
          noteToDelete
            ? `Заметка «${noteToDelete.title}» будет удалена без возможности восстановления.`
            : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setNoteToDelete(null)}
      />
    </section>
  );
}
