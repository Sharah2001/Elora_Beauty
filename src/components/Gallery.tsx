import {type CSSProperties, useEffect, useMemo, useState} from "react";
import Image from "next/image";
import {ArrowRight, Camera, Images, Sparkles, X} from "lucide-react";
import BeforeAfter from "./BeforeAfter";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import SectionHeading from "./ui/SectionHeading";
import {fetchJson} from "../lib/fetchJson";
import "./Gallery.module.css";

type GalleryItem = {
  id: string;
  title: string;
  category?: string;
  image: string;
  imageAlt?: string;
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJson<GalleryItem[]>("/api/gallery")
      .then((items) => {
        setGalleryItems(Array.isArray(items) ? items.slice(0, MAX_GALLERY_ITEMS) : []);
      })
      .catch(() => setError("Our gallery could not be loaded. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedItem(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedItem]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(galleryItems.map((item) => item.category).filter(Boolean) as string[]))],
    [galleryItems],
  );

  const filteredItems =
    selectedCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);
  const visibleItems = preview
    ? filteredItems.slice(0, HOME_PREVIEW_ITEMS)
    : filteredItems.slice(0, MAX_GALLERY_ITEMS);
  const featuredItem = visibleItems[0];

  return (
    <section className={`gallery-section ${preview ? "gallery-section-preview" : "gallery-section-full"} animate-fadeIn`}>
      <div className="gallery-shell">
        <div className="gallery-heading-row">
          <SectionHeading
            align="left"
            eyebrow={
              <span className="inline-flex items-center gap-2">
                <Images className="h-4 w-4" />
                Our portfolio
              </span>
            }
            title="Elora Beauty Gallery"
            description="A closer look at our recent hair, makeup, nail, skin and bridal work."
            className="gallery-heading"
          />
          {featuredItem && (
            <div className="gallery-highlight" aria-label="Latest gallery highlight">
              <Sparkles className="h-4 w-4" />
              <span>Latest first</span>
            </div>
          )}
        </div>

        {!preview && categories.length > 2 && (
          <div className="gallery-category-bar" aria-label="Gallery categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`gallery-category-button ${
                  selectedCategory === category ? "gallery-category-button-active" : ""
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton count={preview ? HOME_PREVIEW_ITEMS : 9} />
        ) : error ? (
          <EmptyState title="Gallery unavailable" description={error} />
        ) : visibleItems.length === 0 ? (
          <EmptyState
            title="No gallery work found"
            description="New portfolio images for this category will appear here once published."
          />
        ) : (
          <div className={`gallery-grid ${preview ? "gallery-grid-preview" : "gallery-grid-full"}`}>
            {visibleItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`gallery-tile ${
                  preview && index === 0 ? "gallery-tile-feature" : ""
                } ${!preview && index % 7 === 0 ? "gallery-tile-tall" : ""}`}
                style={{"--gallery-delay": `${index * 70}ms`} as CSSProperties}
                aria-label={`View ${item.title}`}
              >
                <Image
                  src={item.image}
                  alt={item.imageAlt || item.title}
                  fill
                  sizes={
                    preview && index === 0
                      ? "(max-width: 767px) 100vw, 50vw"
                      : "(max-width: 767px) 50vw, 24vw"
                  }
                  quality={preview && index === 0 ? 76 : 70}
                  className="gallery-tile-image"
                />
                <span className="gallery-tile-vignette" />
                <span className="gallery-tile-shine" />
                <span className="gallery-tile-content">
                  <span className="gallery-tile-meta">
                    <Camera className="h-3.5 w-3.5" />
                    {item.category || "Beauty"}
                  </span>
                  <span className="gallery-tile-title">{item.title}</span>
                  {item.description && (
                    <span className="gallery-tile-description">{item.description}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        )}

        {preview && galleryItems.length > HOME_PREVIEW_ITEMS && onViewMore && (
          <div className="gallery-action-row">
            <Button variant="outline" onClick={onViewMore}>
              View more work
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!preview && (
          <>
            <p className="gallery-count">
              Showing {visibleItems.length} {selectedCategory === "All" ? "portfolio images" : selectedCategory.toLowerCase() + " images"}.
            </p>
            <BeforeAfter />
          </>
        )}
      </div>

      {selectedItem && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onClick={() => setSelectedItem(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="gallery-lightbox-close"
            aria-label="Close gallery image"
          >
            <X className="h-5 w-5" />
          </button>
          <figure
            className="gallery-lightbox-figure"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedItem.image}
              alt={selectedItem.imageAlt || selectedItem.title}
              width={1200}
              height={900}
              sizes="90vw"
              quality={78}
              className="gallery-lightbox-image"
            />
            <figcaption className="gallery-lightbox-caption">
              <p className="gallery-lightbox-meta">
                {selectedItem.category || "Beauty"}
              </p>
              <h3 className="gallery-lightbox-title">{selectedItem.title}</h3>
              {selectedItem.description && (
                <p className="gallery-lightbox-description">{selectedItem.description}</p>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
