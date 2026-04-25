import React from "react";
import { Line, Rect, Group } from "react-konva";

const GRID_SPACING = 100;
const GRID_COLOR = "rgba(0, 0, 0, 0.06)";

interface CarouselGridProps {
  slidesCount: number;
  slideWidth: number;
  slideHeight: number;
  showGrid?: boolean;
}

export const CarouselGrid: React.FC<CarouselGridProps> = ({
  slidesCount,
  slideWidth,
  slideHeight,
  showGrid = false,
}) => {
  const canvasWidth = slidesCount * slideWidth;
  const dividerLines = [];

  for (let i = 1; i < slidesCount; i++) {
    dividerLines.push(
      <Line
        key={`divider-${i}`}
        points={[i * slideWidth, 0, i * slideWidth, slideHeight]}
        stroke="rgba(0, 0, 0, 0.2)"
        strokeWidth={1}
        dash={[10, 5]}
      />,
    );
  }

  const gridLines = [];
  if (showGrid) {
    for (let x = GRID_SPACING; x < canvasWidth; x += GRID_SPACING) {
      gridLines.push(
        <Line
          key={`gv-${x}`}
          points={[x, 0, x, slideHeight]}
          stroke={GRID_COLOR}
          strokeWidth={0.5}
        />,
      );
    }
    for (let y = GRID_SPACING; y < slideHeight; y += GRID_SPACING) {
      gridLines.push(
        <Line
          key={`gh-${y}`}
          points={[0, y, canvasWidth, y]}
          stroke={GRID_COLOR}
          strokeWidth={0.5}
        />,
      );
    }
  }

  return (
    <Group listening={false}>
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={slideHeight}
        fill="#ffffff"
        name="bgRect"
      />
      {gridLines}
      {dividerLines}
    </Group>
  );
};
