import Modal from './Modal';
import Spinner from './Spinner';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', isLoading, danger = true }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-slate-400 text-sm leading-relaxed mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancel</button>
        <button onClick={onConfirm} disabled={isLoading}
          className={danger ? 'btn-danger' : 'btn-primary'}>
          {isLoading && <Spinner size="sm" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
