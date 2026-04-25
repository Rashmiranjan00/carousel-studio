import React from 'react';
import styles from './PreviewModal.module.css';

interface PreviewModalProps {
  slices: string[];
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ slices, onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Preview</h3>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>
        <div className={styles.carouselContainer}>
          <div className={styles.carouselTrack}>
            {slices.map((src, i) => (
              <div key={i} className={styles.slideWrapper}>
                <img src={src} className={styles.slide} alt={`Slide ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
