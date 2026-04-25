import React from "react";
import { useEditorStore } from "@/shared/store/useEditorStore";
import { Canvas } from "./Canvas";
import { Dropzone } from "@/features/media/components/Dropzone";
import { Panel } from "@/shared/components/Panel/Panel";
import styles from "./Workspace.module.css";

export const Workspace: React.FC = () => {
  const {
    slidesCount,
    setSlidesCount,
    aspectRatio,
    setAspectRatio,
    selectedElementId,
    removeElement,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
    showGrid,
    toggleGrid,
    backgroundColor,
    setBackgroundColor,
  } = useEditorStore();

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <Panel title="Document Settings" className={styles.panel}>
          <div className={styles.controlGroup}>
            <label className={styles.label}>
              Number of Slides ({slidesCount})
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={slidesCount}
              onChange={(e) => setSlidesCount(Number(e.target.value))}
              className={styles.rangeInput}
            />
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>Aspect Ratio</label>
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.ratioBtn} ${aspectRatio === "1:1" ? styles.active : ""}`}
                onClick={() => setAspectRatio("1:1")}
              >
                1:1
              </button>
              <button
                className={`${styles.ratioBtn} ${aspectRatio === "4:5" ? styles.active : ""}`}
                onClick={() => setAspectRatio("4:5")}
              >
                4:5
              </button>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={toggleGrid}
                className={styles.checkbox}
              />
              Show Grid
            </label>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.label}>Background</label>
            <div className={styles.colorPickerRow}>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className={styles.colorInput}
              />
              <span className={styles.colorValue}>{backgroundColor}</span>
            </div>
            <div className={styles.presetColors}>
              {["#ffffff", "#000000", "#f3f4f6", "#1e293b", "#6366F1", "#ec4899", "#f59e0b", "#10b981"].map((color) => (
                <button
                  key={color}
                  className={`${styles.colorSwatch} ${backgroundColor === color ? styles.activeSwatch : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setBackgroundColor(color)}
                  aria-label={`Set background to ${color}`}
                />
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Add Media" className={styles.panel}>
          <Dropzone />
        </Panel>

        {selectedElementId && (
          <Panel title="Element Properties" className={styles.panel}>
            <div className={styles.controlGroup}>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.actionBtn}
                  onClick={() => bringToFront(selectedElementId)}
                >
                  Bring to Front
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => bringForward(selectedElementId)}
                >
                  Bring Forward
                </button>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.actionBtn}
                  onClick={() => sendBackward(selectedElementId)}
                >
                  Send Backward
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => sendToBack(selectedElementId)}
                >
                  Send to Back
                </button>
              </div>
              <button
                className={styles.dangerBtn}
                onClick={() => removeElement(selectedElementId)}
              >
                Delete Element
              </button>
            </div>
          </Panel>
        )}
      </aside>

      <main className={styles.mainCanvasArea}>
        <Canvas />
      </main>
    </div>
  );
};
