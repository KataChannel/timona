import { useState, useCallback } from 'react';

/**
 * Modal/Dialog Management Hook
 * 
 * Provides simple API for managing modal/dialog state
 * with open, close, and toggle functions.
 * 
 * @example
 * ```tsx
 * const createModal = useModal();
 * const editModal = useModal();
 * 
 * return (
 *   <>
 *     <Button onClick={createModal.open}>Create</Button>
 *     <Dialog open={createModal.isOpen} onOpenChange={createModal.setIsOpen}>
 *       ...
 *     </Dialog>
 *   </>
 * );
 * ```
 */

export interface UseModalReturn {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Modal with Data Hook
 * 
 * Similar to useModal but also manages associated data
 * (useful for edit modals where you need to pass item data)
 * 
 * @example
 * ```tsx
 * const editModal = useModalWithData<User>();
 * 
 * <Button onClick={() => editModal.openWith(user)}>Edit</Button>
 * 
 * <Dialog open={editModal.isOpen} onOpenChange={editModal.setIsOpen}>
 *   {editModal.data && <UserForm user={editModal.data} />}
 * </Dialog>
 * ```
 */

export interface UseModalWithDataReturn<T> extends UseModalReturn {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  openWith: (data: T) => void;
  closeAndClear: () => void;
}

export function useModalWithData<T = any>(
  initialState = false,
  initialData: T | null = null
): UseModalWithDataReturn<T> {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<T | null>(initialData);
  
  const open = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  const openWith = useCallback((newData: T) => {
    setData(newData);
    setIsOpen(true);
  }, []);
  
  const closeAndClear = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);
  
  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
    data,
    setData,
    openWith,
    closeAndClear,
  };
}
