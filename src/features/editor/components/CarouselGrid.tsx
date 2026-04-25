import React from 'react';
import { Line, Rect, Group } from 'react-konva';

interface CarouselGridProps {
  slidesCount: number;
  slideWidth: number;
  slideHeight: number;
}

export const CarouselGrid: React.FC<CarouselGridProps> = ({ slidesCount, slideWidth, slideHeight }) => {
  const lines = [];
  
  for (let i = 1; i < slidesCount; i++) {
    lines.push(
      <Line
        key={i}
        points={[i * slideWidth, 0, i * slideWidth, slideHeight]}
        stroke="rgba(0, 0, 0, 0.2)"
        strokeWidth={1}
        dash={[10, 5]}
      />
    );
  }

  return (
    <Group listening={false}>
      <Rect
        x={0}
        y={0}
        width={slidesCount * slideWidth}
        height={slideHeight}
        fill="#ffffff"
        name="bgRect"
      />
      {lines}
    </Group>
  );
};
