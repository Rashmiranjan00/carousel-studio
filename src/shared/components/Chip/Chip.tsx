import React from 'react';
import styles from './Chip.module.css';

interface ChipProps {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ label, onRemove, onClick, active }) => {
  return (
    <div 
      className={`${styles.chip} ${active ? styles.active : ''} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
    >
      <span className={styles.label}>{label}</span>
      {onRemove && (
        <button 
          className={styles.removeBtn} 
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </div>
  );
};
