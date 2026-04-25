export interface ProcessedFile {
  src: string;
  width: number;
  height: number;
  type: "image" | "video";
  mimeType: string;
  duration?: number;
}

export const processFile = (file: File): Promise<ProcessedFile> => {
  if (file.type.startsWith("video/")) {
    return processVideo(file);
  }

  return processImage(file);
};

const processImage = (file: File): Promise<ProcessedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({
          src,
          width: img.width,
          height: img.height,
          type: "image",
          mimeType: file.type,
        });
      };
      img.onerror = reject;
      img.src = src;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const processVideo = (file: File): Promise<ProcessedFile> => {
  return new Promise((resolve, reject) => {
    const src = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      resolve({
        src,
        width: video.videoWidth,
        height: video.videoHeight,
        type: "video",
        mimeType: file.type,
        duration: Number.isFinite(video.duration) ? video.duration : undefined,
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error(`Unable to load video metadata for ${file.name}`));
    };
    video.src = src;
  });
};
