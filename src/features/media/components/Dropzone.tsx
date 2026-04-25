import React, { useState, useCallback } from 'react';
import { useEditorStore } from '@/shared/store/useEditorStore';
import { processFile } from '../utils/fileProcessing';
import styles from './Dropzone.module.css';

export const Dropzone: React.FC = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const addElement = useEditorStore(state => state.addElement);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    
    for (const file of files) {
      try {
        const { src, width, height } = await processFile(file);
        
        // Scale down if too large initially
        const MAX_INITIAL_SIZE = 400;
        let finalWidth = width;
        let finalHeight = height;
        if (width > MAX_INITIAL_SIZE || height > MAX_INITIAL_SIZE) {
          const ratio = Math.min(MAX_INITIAL_SIZE / width, MAX_INITIAL_SIZE / height);
          finalWidth = width * ratio;
          finalHeight = height * ratio;
        }

        addElement({
          type: 'image',
          src,
          x: 50, // Default drop position offset
          y: 50,
          width: finalWidth,
          height: finalHeight,
          rotation: 0
        });
      } catch (err) {
        console.error("Failed to process file", err);
      }
    }
  }, [addElement]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  return (
    <div 
      className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className={styles.content}>
        <p className={styles.title}>Drop images here</p>
        <p className={styles.subtext}>Supports JPG, PNG</p>
      </div>
    </div>
  );
};
