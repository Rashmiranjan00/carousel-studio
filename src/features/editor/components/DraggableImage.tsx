import React, { useEffect, useRef } from "react";
import { Image, Transformer } from "react-konva";
import Konva from "konva";
import useImage from "use-image";
import { CanvasElement } from "@/shared/store/useEditorStore";

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
        onDragEnd={(e) => {
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
          flipEnabled={false}
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
