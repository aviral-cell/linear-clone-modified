import React from 'react';
import { cn } from '../../utils/cn';

const detailPanelStyles =
  'fixed top-14 bottom-0 right-0 z-modal border-l border-border bg-background overflow-y-auto transition-transform duration-normal ease-in-out';

function DetailPanel({ isOpen, onClose, children, width = 'w-80', side = 'right', panelRef }) {
  const translateClass = side === 'left' ? '-translate-x-full' : 'translate-x-full';

  return (
    <>
      {isOpen && <div className="lg:hidden overlay-backdrop top-14" onClick={onClose} />}
      <div
        ref={panelRef}
        className={cn(detailPanelStyles, isOpen ? 'translate-x-0' : translateClass, width)}
      >
        {children}
      </div>
    </>
  );
}

export default DetailPanel;
