import React, { useRef, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "@/shared/store/useEditorStore";
import { DraggableImage } from "./DraggableImage";
import { CarouselGrid } from "./CarouselGrid";
import styles from "./Canvas.module.css";

export const SLIDE_WIDTH = 1080;

export const Canvas: React.FC = () => {
  const {
    slidesCount,
    aspectRatio,
    elements,
    selectedElementId,
    selectElement,
    updateElement,
    setStageRef,
    showGrid,
    activeGuides,
  } = useEditorStore();

  const slideHeight = aspectRatio === "1:1" ? 1080 : 1350;
  const stageWidth = slidesCount * SLIDE_WIDTH;

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scale to fit container width visually
  const [scale, setScale] = React.useState(1);

  useEffect(() => {
    if (stageRef.current) {
      setStageRef(stageRef.current);
    }
  }, [setStageRef]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 64; // Add padding
        const newScale = containerWidth / stageWidth;
        setScale(Math.min(newScale, 1)); // Don't scale up past 100%
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [stageWidth]);

  const checkDeselect = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    const clickedOnEmpty =
      e.target === e.target.getStage() || e.target.hasName("bgRect");
    if (clickedOnEmpty) {
      selectElement(null);
    }
  };

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className={styles.canvasContainer} ref={containerRef}>
      <div
        className={styles.stageWrapper}
        style={{
          width: stageWidth * scale,
          height: slideHeight * scale,
        }}
      >
        <Stage
          ref={stageRef}
          width={stageWidth * scale}
          height={slideHeight * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            <CarouselGrid
              slidesCount={slidesCount}
              slideWidth={SLIDE_WIDTH}
              slideHeight={slideHeight}
              showGrid={showGrid}
            />
          </Layer>
          <Layer>
            {sortedElements.map((el) => (
              <DraggableImage
                key={el.id}
                element={el}
                isSelected={el.id === selectedElementId}
                onSelect={() => selectElement(el.id)}
                onChange={(newAttrs) => updateElement(el.id, newAttrs)}
                canvasWidth={stageWidth}
                canvasHeight={slideHeight}
              />
            ))}
          </Layer>
          <Layer listening={false}>
            {activeGuides.x.map((gx, i) => (
              <Line
                key={`gx-${i}`}
                points={[gx, 0, gx, slideHeight]}
                stroke="#6366F1"
                strokeWidth={1}
                dash={[6, 4]}
              />
            ))}
            {activeGuides.y.map((gy, i) => (
              <Line
                key={`gy-${i}`}
                points={[0, gy, stageWidth, gy]}
                stroke="#6366F1"
                strokeWidth={1}
                dash={[6, 4]}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};
