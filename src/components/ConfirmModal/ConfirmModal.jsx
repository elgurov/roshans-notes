import { useEffect, useRef } from 'react';
import './ConfirmModal.css';

/*
  Модалка на нативном <dialog>: фокус удерживается внутри, Esc закрывает,
  фон за окном неактивен.
*/
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Удалить',
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      // Esc или системное закрытие: сообщаем родителю
      onClose={() => {
        if (open) onCancel();
      }}
      // Клик по затемнённому фону
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
    >
      <div className="modal__body">
        <h2 id="modal-title" className="modal__title">
          {title}
        </h2>
        <p className="modal__message">{message}</p>
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Отмена
          </button>
          <button type="button" className="btn btn--primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
