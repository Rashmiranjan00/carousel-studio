import { SLIDE_WIDTH } from "@/features/editor/components/Canvas";
import Konva from "konva";

const FRAME_RATE = 30;
const MAX_VIDEO_EXPORT_SECONDS = 60;
const IMAGE_EXPORT_PIXEL_RATIO = 2;
const VIDEO_EXPORT_PIXEL_RATIO = 2;
const VIDEO_BITS_PER_SECOND = 16_000_000;

export type ExportSlice =
  | {
      kind: "image";
      fileName: string;
      dataUrl: string;
      previewUrl: string;
    }
  | {
      kind: "video";
      fileName: string;
      blob: Blob;
      previewUrl: string;
    };

export const generateSlices = async (
  stage: Konva.Stage,
  slidesCount: number,
  slideHeight: number,
): Promise<ExportSlice[]> => {
  const slices: ExportSlice[] = [];

  for (let i = 0; i < slidesCount; i++) {
    const videoNodes = getVideoNodesInSlide(stage, i, slideHeight);

    if (videoNodes.length > 0) {
      const { blob, extension } = await recordVideoSlice(
        stage,
        i,
        slideHeight,
        videoNodes,
      );
      slices.push({
        kind: "video",
        fileName: `slide-${i + 1}.${extension}`,
        blob,
        previewUrl: URL.createObjectURL(blob),
      });
    } else {
      const dataUrl = stage.toDataURL({
        x: i * SLIDE_WIDTH,
        y: 0,
        width: SLIDE_WIDTH,
        height: slideHeight,
        pixelRatio: IMAGE_EXPORT_PIXEL_RATIO,
      });
      slices.push({
        kind: "image",
        fileName: `slide-${i + 1}.png`,
        dataUrl,
        previewUrl: dataUrl,
      });
    }
  }

  return slices;
};

const getVideoNodesInSlide = (
  stage: Konva.Stage,
  slideIndex: number,
  slideHeight: number,
) => {
  const slideLeft = slideIndex * SLIDE_WIDTH;
  const slideRight = slideLeft + SLIDE_WIDTH;

  return stage.find(".videoElement").filter((node) => {
    if (!(node instanceof Konva.Image)) return false;
    if (!(node.image() instanceof HTMLVideoElement)) return false;

    const rect = node.getClientRect({ relativeTo: stage });
    return (
      rect.x < slideRight &&
      rect.x + rect.width > slideLeft &&
      rect.y < slideHeight &&
      rect.y + rect.height > 0
    );
  }) as Konva.Image[];
};

const recordVideoSlice = async (
  stage: Konva.Stage,
  slideIndex: number,
  slideHeight: number,
  videoNodes: Konva.Image[],
): Promise<{ blob: Blob; extension: "mp4" | "webm" }> => {
  const canvas = document.createElement("canvas");
  canvas.width = SLIDE_WIDTH * VIDEO_EXPORT_PIXEL_RATIO;
  canvas.height = slideHeight * VIDEO_EXPORT_PIXEL_RATIO;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create export canvas context.");
  }

  const stream = canvas.captureStream(FRAME_RATE);
  const { mimeType, extension } = getSupportedVideoRecorderType();
  const recorder = new MediaRecorder(
    stream,
    {
      ...(mimeType ? { mimeType } : {}),
      videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
    },
  );
  const chunks: Blob[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const videos = videoNodes
    .map((node) => node.image())
    .filter((source): source is HTMLVideoElement => source instanceof HTMLVideoElement);
  const previousState = videos.map((video) => ({
    video,
    currentTime: video.currentTime,
    loop: video.loop,
    paused: video.paused,
  }));

  const duration = getExportDuration(videos);

  await Promise.all(
    videos.map(async (video) => {
      video.pause();
      video.loop = false;
      await seekVideo(video, 0);
      await video.play().catch(() => undefined);
    }),
  );

  let frameId = 0;
  const startedAt = performance.now();

  const drawFrame = () => {
    const frameCanvas = stage.toCanvas({
      x: slideIndex * SLIDE_WIDTH,
      y: 0,
      width: SLIDE_WIDTH,
      height: slideHeight,
      pixelRatio: VIDEO_EXPORT_PIXEL_RATIO,
    });
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(frameCanvas, 0, 0);
    frameId = requestAnimationFrame(drawFrame);
  };

  drawFrame();

  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: recorder.mimeType || "video/webm" }));
    };
  });

  recorder.start();
  await delay(duration * 1000);
  recorder.stop();
  cancelAnimationFrame(frameId);
  stream.getTracks().forEach((track) => track.stop());

  await restoreVideos(previousState, startedAt);

  return {
    blob: await stopped,
    extension,
  };
};

const getExportDuration = (videos: HTMLVideoElement[]) => {
  const longest = Math.max(
    ...videos.map((video) =>
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 5,
    ),
  );

  return Math.min(longest, MAX_VIDEO_EXPORT_SECONDS);
};

const getSupportedVideoRecorderType = (): {
  mimeType: string | undefined;
  extension: "mp4" | "webm";
} => {
  const mp4MimeType = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4;codecs=h264",
    "video/mp4",
  ].find((type) => MediaRecorder.isTypeSupported(type));

  if (mp4MimeType) {
    return { mimeType: mp4MimeType, extension: "mp4" };
  }

  const webmMimeType = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ].find((type) => MediaRecorder.isTypeSupported(type));

  return { mimeType: webmMimeType, extension: "webm" };
};

const seekVideo = (video: HTMLVideoElement, time: number) =>
  new Promise<void>((resolve) => {
    const duration =
      Number.isFinite(video.duration) && video.duration > 0
        ? video.duration
        : time;
    const safeTime = Math.max(0, Math.min(time, duration));

    if (Math.abs(video.currentTime - safeTime) < 0.05) {
      resolve();
      return;
    }

    const handleSeeked = () => {
      window.clearTimeout(fallback);
      video.removeEventListener("seeked", handleSeeked);
      resolve();
    };
    const fallback = window.setTimeout(handleSeeked, 500);

    video.addEventListener("seeked", handleSeeked);
    video.currentTime = safeTime;
  });

const restoreVideos = async (
  previousState: Array<{
    video: HTMLVideoElement;
    currentTime: number;
    loop: boolean;
    paused: boolean;
  }>,
  startedAt: number,
) => {
  await Promise.all(
    previousState.map(async ({ video, currentTime, loop, paused }) => {
      video.loop = loop;
      await seekVideo(video, currentTime + (performance.now() - startedAt) / 1000);
      if (paused) {
        video.pause();
      } else {
        await video.play().catch(() => undefined);
      }
    }),
  );
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
