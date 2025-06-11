import React from "react";

const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ children }) => (
  <div className="text-lg font-semibold mb-4">{children}</div>
);

const ModalBody = ({ children }) => <div>{children}</div>;

export { Modal, ModalHeader, ModalBody };