import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ExportSlice } from "./slicingEngine";

export const downloadSlicesAsZip = async (slices: ExportSlice[]) => {
  const zip = new JSZip();

  slices.forEach((slice) => {
    if (slice.kind === "image") {
      const base64Data = slice.dataUrl.replace(/^data:image\/png;base64,/, "");
      zip.file(slice.fileName, base64Data, { base64: true });
      return;
    }

    zip.file(slice.fileName, slice.blob);
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "carousel-studio-export.zip");
};
