import {useEffect, useMemo, useState} from "react";
import Image from "next/image";
import {ArrowRight, Images, X} from "lucide-react";
import BeforeAfter from "./BeforeAfter";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import SectionHeading from "./ui/SectionHeading";
import {fetchJson} from "../lib/fetchJson";

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

  return (
    <section className="space-y-8 py-4 animate-fadeIn">
      <SectionHeading
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Images className="h-4 w-4" />
            Our portfolio
          </span>
        }
        title="Elora Beauty Gallery"
        description="A closer look at our recent hair, makeup, nail, skin and bridal work."
      />

      {!preview && categories.length > 2 && (
        <div className="flex flex-wrap justify-center gap-2" aria-label="Gallery categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`min-h-9 rounded-full px-4 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
                selectedCategory === category
                  ? "bg-brand-gold text-white"
                  : "border border-stone-200 bg-white text-stone-600 hover:border-brand-gold"
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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {visibleItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedItem(item)}
              className={`group relative overflow-hidden rounded-2xl bg-stone-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 ${
                !preview && index % 5 === 0 ? "md:row-span-2 md:aspect-auto" : "aspect-square"
              }`}
              aria-label={`View ${item.title}`}
            >
              <Image
                src={item.image}
                alt={item.imageAlt || item.title}
                fill
                sizes="(max-width: 767px) 50vw, 33vw"
                quality={68}
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 transition group-hover:opacity-100" />
              <span className="absolute inset-x-0 bottom-0 p-4">
                <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-[#E0C17C]">
                  {item.category || "Beauty"}
                </span>
                <span className="mt-1 block font-serif text-sm font-semibold text-white sm:text-base">
                  {item.title}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {preview && galleryItems.length > HOME_PREVIEW_ITEMS && onViewMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onViewMore}>
            View more work
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!preview && (
        <>
          <p className="text-center text-xs text-stone-400">
            Showing {visibleItems.length} {selectedCategory === "All" ? "portfolio images" : selectedCategory.toLowerCase() + " images"}.
          </p>
          <BeforeAfter />
        </>
      )}

      {selectedItem && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onClick={() => setSelectedItem(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedItem(null)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            aria-label="Close gallery image"
          >
            <X className="h-5 w-5" />
          </button>
          <figure
            className="max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-brand-ink"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedItem.image}
              alt={selectedItem.imageAlt || selectedItem.title}
              width={1200}
              height={900}
              sizes="90vw"
              quality={78}
              className="max-h-[76vh] w-full object-contain"
            />
            <figcaption className="p-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                {selectedItem.category || "Beauty"}
              </p>
              <h3 className="mt-1 font-serif text-xl font-semibold">{selectedItem.title}</h3>
              {selectedItem.description && (
                <p className="mt-2 text-sm leading-6 text-stone-400">{selectedItem.description}</p>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
