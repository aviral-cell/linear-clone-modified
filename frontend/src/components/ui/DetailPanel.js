import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Slide-over detail panel with mobile overlay.
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {React.ReactNode} children
 * @param {string} [width='w-80']
 * @param {'left'|'right'} [side='right']
 * @param {React.RefObject} [panelRef]
 */
function DetailPanel({ isOpen, onClose, children, width = 'w-80', side = 'right', panelRef }) {
  const translateClass = side === 'left' ? '-translate-x-full' : 'translate-x-full';

  return (
    <>
      {isOpen && (
        <div className="lg:hidden overlay-backdrop top-14" onClick={onClose} />
      )}
      <div
        ref={panelRef}
        className={cn('detail-panel', isOpen ? 'translate-x-0' : translateClass, width)}
      >
        {children}
      </div>
    </>
  );
}

export default DetailPanel;
