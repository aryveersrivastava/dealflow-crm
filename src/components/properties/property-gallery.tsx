"use client";

import { useState } from "react";
import { Building2, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface PropertyGalleryProps {
  images: string[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const hasImages = images && images.length > 0;

  const nextImage = () => {
    if (!hasImages) return;
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!hasImages) return;
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!hasImages) {
    return (
      <div className="h-64 sm:h-80 w-full bg-gradient-to-br from-primary/10 via-accent/5 to-background flex flex-col items-center justify-center border-b relative rounded-2xl overflow-hidden shadow-inner">
        <Building2 className="h-20 w-20 text-primary/20 animate-pulse" />
        <span className="text-xs text-muted-foreground mt-3 font-semibold tracking-wide">
          No listing images uploaded yet
        </span>
      </div>
    );
  }

  const activeImage = images[activeImageIndex];

  return (
    <div className="space-y-3">
      {/* Primary Hero Display */}
      <div className="relative h-80 sm:h-[400px] w-full rounded-2xl overflow-hidden group bg-black/5 dark:bg-black/40 border">
        {/* Main Image */}
        <div className="relative w-full h-full">
          <img
            src={activeImage}
            alt={`Property Visual ${activeImageIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
          />
        </div>

        {/* Navigation Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/10 hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/10 hover:scale-105"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Zoom Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 flex items-center justify-center h-9 w-9 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Badge counter */}
        <div className="absolute top-4 left-4 text-[10px] font-bold bg-black/60 border border-white/10 text-white rounded-md px-2.5 py-1 backdrop-blur-sm tracking-wide">
          {activeImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={`relative h-16 w-24 rounded-lg overflow-hidden shrink-0 transition-all border-2 ${
                activeImageIndex === idx
                  ? "border-primary scale-[1.02] shadow-sm"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center animate-fade-in">
          {/* Top Bar */}
          <div className="absolute top-4 left-0 right-0 px-6 flex justify-between items-center z-50">
            <span className="text-white/80 font-bold text-sm">
              Image {activeImageIndex + 1} of {images.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/85 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Main Visual */}
          <div className="relative max-w-5xl max-h-[80vh] w-full px-4 flex items-center justify-center">
            <img
              src={activeImage}
              alt="Fullscreen property preview"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Lightbox navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/5"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/5"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
