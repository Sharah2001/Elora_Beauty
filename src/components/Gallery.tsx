import React, {useEffect, useState} from "react";
import {ArrowRight, Images} from "lucide-react";
import BeforeAfter from "./BeforeAfter";

type GalleryItem = {
  id: string;
  title: string;
  category?: string;
  image: string;
  description?: string;
  createdAt?: string;
};

interface GalleryProps {
  preview?: boolean;
  onViewMore?: () => void;
}

const MAX_GALLERY_ITEMS = 24;
const HOME_PREVIEW_ITEMS = 6;

export default function Gallery({preview = false, onViewMore}: GalleryProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((response) => response.json())
      .then((items) => {
        setGalleryItems(Array.isArray(items) ? items.slice(0, MAX_GALLERY_ITEMS) : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleItems = preview
    ? galleryItems.slice(0, HOME_PREVIEW_ITEMS)
    : galleryItems.slice(0, MAX_GALLERY_ITEMS);

  return (
    <section className="space-y-8 py-4 animate-fadeIn">
      <div className="mx-auto max-w-xl space-y-2 text-center">
        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
          <Images className="h-4 w-4" />
          Our work
        </span>
        <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">
          Elora Beauty Gallery
        </h2>
        <p className="text-sm font-light text-stone-500">
          Explore our latest nail art, bridal makeup, threading, facial, waxing, hair, and spa work.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({length: preview ? HOME_PREVIEW_ITEMS : 9}).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse bg-stone-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="group relative aspect-square overflow-hidden border border-[#C5A059]/15 bg-stone-100"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-4 pb-4 pt-16">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#D8B96E]">
                  {item.category || "Beauty"}
                </p>
                <h3 className="mt-1 font-serif text-sm font-semibold text-white sm:text-base">
                  {item.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      )}

      {preview && galleryItems.length > HOME_PREVIEW_ITEMS && onViewMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onViewMore}
            className="inline-flex min-h-11 items-center gap-2 border border-[#C5A059] px-6 text-sm font-bold text-[#AA823B] transition hover:bg-[#C5A059] hover:text-white cursor-pointer"
          >
            View More Work
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {!preview && (
        <>
          <p className="text-center text-xs text-stone-400">
            Showing the latest {visibleItems.length} gallery images.
          </p>
          <BeforeAfter />
        </>
      )}
    </section>
  );
}
