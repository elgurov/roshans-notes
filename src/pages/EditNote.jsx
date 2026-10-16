import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import NoteForm from '../components/NoteForm/NoteForm';
import { deleteNote, getNoteById, updateNote } from '../api/notesApi';
import { useAuth } from '../context/AuthContext';
import '../components/NoteForm/NoteForm.css';

export default function EditNote() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Заметку читаем один раз на смену id
  const note = useMemo(() => {
    const found = getNoteById(id);
    // Чужую заметку не показываем: для пользователя её «не существует»
    return found && found.ownerId === user.id ? found : null;
  }, [id, user.id]);

  if (!note) {
    return (
      <section className="note-page">
        <div className="note-page__panel">
          <h1 className="note-page__title">Заметка не найдена</h1>
          <p>Возможно, она удалена или принадлежит другому пользователю.</p>
          <Link to="/dashboard" className="btn btn--primary">
            В личный кабинет
          </Link>
        </div>
      </section>
    );
  }

  const handleSubmit = (values) => {
    updateNote(note.id, user.id, values);
    navigate('/dashboard');
  };

  const handleDelete = () => {
    deleteNote(note.id, user.id);
    navigate('/dashboard');
  };

  return (
    <section className="note-page">
      <Link to="/dashboard" className="note-page__back">
        ← Назад в кабинет
      </Link>

      <div className="note-page__panel">
        <h1 className="note-page__title">Редактирование заметки</h1>

        {/* key: при смене заметки форма создаётся заново с новыми значениями */}
        <NoteForm
          key={note.id}
          initialValues={{
            title: note.title,
            hero: note.hero
              ? { id: note.heroId, name: note.hero, attr: note.attr, img: note.img }
              : null,
            story: note.story,
            outcome: note.outcome,
            opinion: note.opinion,
          }}
          submitLabel="Сохранить изменения"
          onSubmit={handleSubmit}
          extraActions={
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => setConfirmOpen(true)}
            >
              Удалить
            </button>
          }
        />
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Удалить заметку?"
        message={`Заметка «${note.title}» будет удалена без возможности восстановления.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
