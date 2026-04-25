import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const downloadSlicesAsZip = async (slices: string[]) => {
  const zip = new JSZip();
  
  slices.forEach((dataUrl, index) => {
    // Strip the "data:image/png;base64," prefix
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    zip.file(`slide-${index + 1}.png`, base64Data, { base64: true });
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'carousel-studio-export.zip');
};
