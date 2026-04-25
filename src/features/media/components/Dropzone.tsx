import React, { useState, useCallback, useRef } from 'react';
import { useEditorStore } from '@/shared/store/useEditorStore';
import { processFile } from '../utils/fileProcessing';
import { Button } from '@/shared/components/Button/Button';
import styles from './Dropzone.module.css';

export const Dropzone: React.FC = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const addElement = useEditorStore(state => state.addElement);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    for (const file of imageFiles) {
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

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
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};
