import { SLIDE_WIDTH } from '@/features/editor/components/Canvas';
import Konva from 'konva';

export const generateSlices = async (stage: Konva.Stage, slidesCount: number, slideHeight: number): Promise<string[]> => {
  const slices: string[] = [];
  const originalScale = stage.scaleX();
  
  // Reset scale to 1 for high quality export based on true pixels
  stage.scale({ x: 1, y: 1 });
  
  for (let i = 0; i < slidesCount; i++) {
    const dataURL = stage.toDataURL({
      x: i * SLIDE_WIDTH,
      y: 0,
      width: SLIDE_WIDTH,
      height: slideHeight,
      pixelRatio: 2 // High resolution output
    });
    slices.push(dataURL);
  }
  
  // Restore scale
  stage.scale({ x: originalScale, y: originalScale });
  
  return slices;
};
