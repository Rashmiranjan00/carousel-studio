"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/shared/components/Button/Button";
import { useEditorStore } from "@/shared/store/useEditorStore";
import {
  ExportSlice,
  generateSlices,
} from "@/features/export/utils/slicingEngine";
import { downloadSlicesAsZip } from "@/features/export/utils/zipGenerator";
import { PreviewModal } from "@/features/preview/components/PreviewModal";

const DynamicWorkspace = dynamic(
  () =>
    import("@/features/editor/components/Workspace").then(
      (mod) => mod.Workspace,
    ),
  { ssr: false },
);

export default function Home() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSlices, setPreviewSlices] = useState<ExportSlice[]>([]);
  const { stageRef, slidesCount, aspectRatio, selectElement } = useEditorStore();
  const [isExporting, setIsExporting] = useState(false);

  const slideHeight = aspectRatio === '1:1' ? 1080 : 1350;

  const handlePreview = async () => {
    if (!stageRef) return;
    selectElement(null);
    setTimeout(async () => {
      const slices = await generateSlices(stageRef, slidesCount, slideHeight);
      setPreviewSlices(slices);
      setIsPreviewOpen(true);
    }, 50);
  };

  const handleExport = async () => {
    if (!stageRef) return;
    setIsExporting(true);
    selectElement(null);
    setTimeout(async () => {
      try {
        const slices = await generateSlices(stageRef, slidesCount, slideHeight);
        await downloadSlicesAsZip(slices);
      } finally {
        setIsExporting(false);
      }
    }, 50);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header style={{ height: "var(--toolbar-height)", borderBottom: "1px solid var(--color-outline-variant)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 var(--spacing-md)", backgroundColor: "var(--color-surface)" }}>
        <h1 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-primary)" }}>Carousel Studio</h1>
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          <Button variant="secondary" onClick={handlePreview}>Preview</Button>
          <Button variant="primary" onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export ZIP'}
          </Button>
        </div>
      </header>
      
      <DynamicWorkspace />
      
      {isPreviewOpen && (
        <PreviewModal slices={previewSlices} onClose={() => setIsPreviewOpen(false)} />
      )}
    </div>
  );
}
