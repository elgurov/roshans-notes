import { Link, useNavigate } from 'react-router-dom';

import NoteForm from '../components/NoteForm/NoteForm';
import { createNote } from '../api/notesApi';
import { useAuth } from '../context/AuthContext';
import '../components/NoteForm/NoteForm.css';

export default function CreateNote() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    createNote(user.id, values);
    navigate('/dashboard');
  };

  return (
    <section className="note-page">
      <Link to="/dashboard" className="note-page__back">
        ← Назад в кабинет
      </Link>

      <div className="note-page__panel">
        <h1 className="note-page__title">Новая заметка</h1>
        <p className="note-page__lead">
          Ты был у моего логова и всё видел. Выбери героя, расскажи, что он со
          мной делал, и скажи, что об этом думаешь.
        </p>
        <NoteForm submitLabel="Сохранить заметку" onSubmit={handleSubmit} />
      </div>
    </section>
  );
}
