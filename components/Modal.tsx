
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-surface rounded-lg shadow-xl p-6 w-11/12 max-w-lg m-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
