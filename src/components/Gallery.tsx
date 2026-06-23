import React from "react";

const galleryItems = [
  {
    title: "Nude pink gel manicure design",
    tag: "Nails Expert",
    img: "/images/nail-art-showcase.jpg"
  },
  {
    title: "Colombo cocktail makeup application",
    tag: "Makeup Artist",
    img: "/images/makeup-showcase.jpg"
  },
  {
    title: "Italian protective balayage treatment",
    tag: "Hair Dresser",
    img: "https://picsum.photos/seed/balayagebeauty/500/500"
  },
  {
    title: "Royal Kandyan bride sari draping detail",
    tag: "Bridal Suite",
    img: "https://picsum.photos/seed/kandyanbridal/500/500"
  },
  {
    title: "Hydrated organic facial skin result",
    tag: "Skin Clinic",
    img: "https://picsum.photos/seed/facialsing/500/500"
  },
  {
    title: "Modern western bridal styling set",
    tag: "Bridal Suite",
    img: "https://picsum.photos/seed/weddingdressingsl/550/550"
  }
];

export default function Gallery() {
  return (
    <section className="space-y-12 py-4 animate-fadeIn">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Elora Visual Catalogue</h2>
        <p className="text-stone-500 text-sm font-light">
          Actual unedited outcomes from our Colombo beauty parlor rooms.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map((item) => (
          <div
            key={item.title}
            className="bg-white border border-[#C5A059]/10 rounded-2xl overflow-hidden shadow-sm hover:border-[#C5A059]/30 transition-all"
          >
            <div className="h-56 bg-stone-100 overflow-hidden relative group">
              <img
                src={item.img}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-350"
              />
            </div>
            <div className="p-4 flex justify-between items-center bg-white border-t border-stone-100">
              <h4 className="font-serif font-bold text-xs text-[#1A1A1A] leading-snug">{item.title}</h4>
              <span className="text-[10px] text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-0.5 rounded font-mono uppercase shrink-0 ml-2 font-bold">
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
