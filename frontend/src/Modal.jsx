import React from 'react';

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl leading-none text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
