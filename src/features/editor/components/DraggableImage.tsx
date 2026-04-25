import React, { useEffect, useRef, useMemo } from "react";
import { Image, Transformer } from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import { CanvasElement, useEditorStore } from "@/shared/store/useEditorStore";
import { detectSnap, getSnapTargets } from "@/features/editor/utils/snapEngine";
import { SLIDE_WIDTH } from "./Canvas";

interface DraggableImageProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<CanvasElement>) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export const DraggableImage: React.FC<DraggableImageProps> = ({
  element,
  isSelected,
  onSelect,
  onChange,
  canvasWidth,
  canvasHeight,
}) => {
  const [image] = useImage(element.src);
  const imageRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { slidesCount, setActiveGuides, clearActiveGuides } = useEditorStore();

  const snapTargets = useMemo(
    () => getSnapTargets(slidesCount, SLIDE_WIDTH, canvasHeight),
    [slidesCount, canvasHeight],
  );

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const dragBoundFunc = (pos: { x: number; y: number }) => {
    const nodeWidth = element.width;
    const nodeHeight = element.height;
    return {
      x: Math.max(0, Math.min(pos.x, canvasWidth - nodeWidth)),
      y: Math.max(0, Math.min(pos.y, canvasHeight - nodeHeight)),
    };
  };

  return (
    <React.Fragment>
      <Image
        ref={imageRef}
        image={image}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        draggable
        dragBoundFunc={dragBoundFunc}
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={(e) => {
          const node = e.target;
          const result = detectSnap(
            node.x(),
            node.y(),
            element.width,
            element.height,
            snapTargets,
          );
          node.x(result.x);
          node.y(result.y);
          setActiveGuides({ x: result.guidesX, y: result.guidesY });
        }}
        onDragEnd={(e) => {
          clearActiveGuides();
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = imageRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          keepRatio={true}
          flipEnabled={false}
          rotationSnaps={[0, 90, 180, 270]}
          rotationSnapTolerance={5}
          borderStroke="#6366F1"
          borderStrokeWidth={1.5}
          anchorStroke="#6366F1"
          anchorFill="#ffffff"
          anchorSize={8}
          anchorCornerRadius={2}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};
