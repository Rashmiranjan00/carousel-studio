import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image as KonvaImage, Transformer } from "react-konva";
import Konva from "konva";
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
  const [media, setMedia] = useState<HTMLImageElement | HTMLVideoElement>();
  const imageRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const { slidesCount, setActiveGuides, clearActiveGuides } = useEditorStore();
  const isVideo = element.type === "video";

  const snapTargets = useMemo(
    () => getSnapTargets(slidesCount, SLIDE_WIDTH, canvasHeight),
    [slidesCount, canvasHeight],
  );

  useEffect(() => {
    let cancelled = false;
    let video: HTMLVideoElement | null = null;

    if (isVideo) {
      video = document.createElement("video");
      video.src = element.src;
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.onloadeddata = () => {
        if (cancelled || !video) return;
        setMedia(video);
        void video.play().catch(() => undefined);
      };
    } else {
      const image = new window.Image();
      image.onload = () => {
        if (!cancelled) setMedia(image);
      };
      image.src = element.src;
    }

    return () => {
      cancelled = true;
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
    };
  }, [element.src, isVideo]);

  useEffect(() => {
    if (!isVideo || !media || !(media instanceof HTMLVideoElement)) return;

    let animationFrame = 0;
    const draw = () => {
      imageRef.current?.getLayer()?.batchDraw();
      animationFrame = requestAnimationFrame(draw);
    };

    void media.play().catch(() => undefined);
    draw();

    return () => cancelAnimationFrame(animationFrame);
  }, [isVideo, media]);

  useEffect(() => {
    if (isSelected && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const clampNodePosition = (
    pos: { x: number; y: number },
    size = { width: element.width, height: element.height },
    rotation = element.rotation,
  ) => {
    const rect = getRotatedRect({ ...pos, ...size, rotation });
    const bounds = {
      left: 0,
      top: 0,
      right: canvasWidth,
      bottom: canvasHeight,
    };
    const offset = getClampOffset(rect, bounds);

    return {
      x: pos.x + offset.x,
      y: pos.y + offset.y,
    };
  };

  return (
    <React.Fragment>
      <KonvaImage
        ref={imageRef}
        image={media}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        draggable
        name={isVideo ? "videoElement" : "imageElement"}
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={(e) => {
          const node = e.target;
          const snapped = detectSnap(
            node.x(),
            node.y(),
            element.width,
            element.height,
            snapTargets,
          );
          const result = clampNodePosition({ x: snapped.x, y: snapped.y });
          node.x(result.x);
          node.y(result.y);
          setActiveGuides({ x: snapped.guidesX, y: snapped.guidesY });
        }}
        onDragEnd={(e) => {
          clearActiveGuides();
          const result = clampNodePosition(
            { x: e.target.x(), y: e.target.y() },
            { width: element.width, height: element.height },
            e.target.rotation(),
          );
          onChange({
            x: result.x,
            y: result.y,
            slideIndex: undefined,
          });
        }}
        onTransformEnd={() => {
          const node = imageRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          const width = Math.max(5, node.width() * scaleX);
          const height = Math.max(5, node.height() * scaleY);
          const maxWidth = canvasWidth;
          const widthBounded = Math.min(width, maxWidth);
          const heightBounded = width > maxWidth ? height * (maxWidth / width) : height;
          const fittedSize = fitRotatedSizeToBounds(
            { width: widthBounded, height: heightBounded },
            node.rotation(),
            { width: canvasWidth, height: canvasHeight },
          );
          const finalWidth = fittedSize.width;
          const finalHeight = fittedSize.height;

          if (
            !isFiniteNumber(finalWidth) ||
            !isFiniteNumber(finalHeight) ||
            !isFiniteNumber(node.x()) ||
            !isFiniteNumber(node.y()) ||
            !isFiniteNumber(node.rotation())
          ) {
            node.scaleX(1);
            node.scaleY(1);
            return;
          }

          const position = clampNodePosition(
            {
              x: node.x(),
              y: Math.min(node.y(), canvasHeight - finalHeight),
            },
            { width: finalWidth, height: finalHeight },
            node.rotation(),
          );

          onChange({
            x: position.x,
            y: position.y,
            width: finalWidth,
            height: finalHeight,
            rotation: node.rotation(),
            slideIndex: undefined,
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

const isFiniteNumber = (value: number) => Number.isFinite(value);

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const getRotatedRect = ({
  x,
  y,
  width,
  height,
  rotation,
}: Rect & { rotation: number }): Rect => {
  const angle = (rotation * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const points = [
    { x: 0, y: 0 },
    { x: width * cos, y: width * sin },
    { x: -height * sin, y: height * cos },
    { x: width * cos - height * sin, y: width * sin + height * cos },
  ];
  const xs = points.map((point) => x + point.x);
  const ys = points.map((point) => y + point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

const getClampOffset = (rect: Rect, bounds: Bounds) => ({
  x: getAxisClampOffset(rect.x, rect.x + rect.width, bounds.left, bounds.right),
  y: getAxisClampOffset(rect.y, rect.y + rect.height, bounds.top, bounds.bottom),
});

const getAxisClampOffset = (
  rectMin: number,
  rectMax: number,
  boundMin: number,
  boundMax: number,
) => {
  const rectSize = rectMax - rectMin;
  const boundSize = boundMax - boundMin;

  if (rectSize > boundSize) {
    return (boundMin + boundMax) / 2 - (rectMin + rectMax) / 2;
  }
  if (rectMin < boundMin) return boundMin - rectMin;
  if (rectMax > boundMax) return boundMax - rectMax;
  return 0;
};

const fitRotatedSizeToBounds = (
  size: { width: number; height: number },
  rotation: number,
  bounds: { width: number; height: number },
) => {
  const rect = getRotatedRect({ x: 0, y: 0, ...size, rotation });
  const scale = Math.min(
    1,
    bounds.width / rect.width,
    bounds.height / rect.height,
  );

  return {
    width: size.width * scale,
    height: size.height * scale,
  };
};
