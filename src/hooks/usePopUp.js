import { useState } from 'react';

/**
 * Hook para manejar un PopUp
 * @param {boolean} initialValue: Estado inicial del PopUp
 * @returns [isOpen, function open, function close]
 */
const usePopUp = (initialValue = false) => {
  const [isOpen, setIsOpen] = useState(initialValue);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return [isOpen, open, close];
};

export default usePopUp;
