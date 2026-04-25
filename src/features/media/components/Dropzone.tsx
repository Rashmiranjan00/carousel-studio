import React, { useCallback, useRef, useState } from "react";
import { useEditorStore } from "@/shared/store/useEditorStore";
import { processFile } from "../utils/fileProcessing";
import { Button } from "@/shared/components/Button/Button";
import styles from "./Dropzone.module.css";

export const Dropzone: React.FC = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const addElement = useEditorStore((state) => state.addElement);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const mediaFiles = files.filter(
        (file) =>
          file.type.startsWith("image/") || file.type.startsWith("video/"),
      );

      for (const file of mediaFiles) {
        try {
          const media = await processFile(file);

          addElement({
            type: media.type,
            src: media.src,
            mimeType: media.mimeType,
            x: 50,
            y: 50,
            width: media.width,
            height: media.height,
            rotation: 0,
            duration: media.duration,
          });
        } catch (err) {
          console.error("Failed to process file", err);
        }
      }
    },
    [addElement],
  );

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
      className={`${styles.dropzone} ${isDragActive ? styles.active : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className={styles.content}>
        <p className={styles.title}>Drop media here</p>
        <p className={styles.subtext}>Supports JPG, PNG, MP4, MOV</p>
        <div style={{ marginTop: "var(--spacing-md)" }}>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/mp4,video/quicktime"
            multiple
            style={{ display: "none" }}
          />
        </div>
      </div>
    </div>
  );
};
