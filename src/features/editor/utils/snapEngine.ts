export const SNAP_THRESHOLD = 7;

export interface SnapResult {
  x: number;
  y: number;
  guidesX: number[];
  guidesY: number[];
}

export function getSnapTargets(
  slidesCount: number,
  slideWidth: number,
  canvasHeight: number,
): { vertical: number[]; horizontal: number[] } {
  const canvasWidth = slidesCount * slideWidth;
  const vertical: number[] = [];
  const horizontal: number[] = [];

  // Slide edges
  for (let i = 0; i <= slidesCount; i++) {
    vertical.push(i * slideWidth);
  }

  // Slide centers
  for (let i = 0; i < slidesCount; i++) {
    vertical.push(i * slideWidth + slideWidth / 2);
  }

  // Canvas horizontal guides: top, center, bottom
  horizontal.push(0, canvasHeight / 2, canvasHeight);

  return { vertical, horizontal };
}

export function detectSnap(
  x: number,
  y: number,
  width: number,
  height: number,
  snapTargets: { vertical: number[]; horizontal: number[] },
): SnapResult {
  let snappedX = x;
  let snappedY = y;
  const guidesX: number[] = [];
  const guidesY: number[] = [];

  const elementLeft = x;
  const elementCenterX = x + width / 2;
  const elementRight = x + width;

  const elementTop = y;
  const elementCenterY = y + height / 2;
  const elementBottom = y + height;

  // Check vertical snap targets against element left, center, right edges
  for (const target of snapTargets.vertical) {
    if (Math.abs(elementLeft - target) < SNAP_THRESHOLD) {
      snappedX = target;
      guidesX.push(target);
      break;
    }
    if (Math.abs(elementCenterX - target) < SNAP_THRESHOLD) {
      snappedX = target - width / 2;
      guidesX.push(target);
      break;
    }
    if (Math.abs(elementRight - target) < SNAP_THRESHOLD) {
      snappedX = target - width;
      guidesX.push(target);
      break;
    }
  }

  // Check horizontal snap targets against element top, center, bottom edges
  for (const target of snapTargets.horizontal) {
    if (Math.abs(elementTop - target) < SNAP_THRESHOLD) {
      snappedY = target;
      guidesY.push(target);
      break;
    }
    if (Math.abs(elementCenterY - target) < SNAP_THRESHOLD) {
      snappedY = target - height / 2;
      guidesY.push(target);
      break;
    }
    if (Math.abs(elementBottom - target) < SNAP_THRESHOLD) {
      snappedY = target - height;
      guidesY.push(target);
      break;
    }
  }

  return { x: snappedX, y: snappedY, guidesX, guidesY };
}
