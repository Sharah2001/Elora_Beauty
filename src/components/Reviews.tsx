import React, { useState, useEffect } from "react";
import { Star, MessageSquareCode, Check, Send, AlertCircle } from "lucide-react";
import { Testimonial, Service, Branch } from "../types";
import EmptyState from "./ui/EmptyState";
import LoadingSkeleton from "./ui/LoadingSkeleton";
import SectionHeading from "./ui/SectionHeading";

interface ReviewsProps {
  showForm?: boolean;
}

export default function Reviews({showForm = true}: ReviewsProps) {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  // Review Form status
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Input states
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const refreshReviews = () => {
    fetch("/api/testimonials")
      .then((res) => {
        if (!res.ok) throw new Error("Reviews unavailable.")
        return res.json()
      })
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviewsError("Guest reviews could not be loaded."))
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    refreshReviews();

    if (showForm) {
      fetch("/api/services")
        .then((res) => res.json())
        .then((data) => setServices(data));

      fetch("/api/branches")
        .then((res) => res.json())
        .then((data) => setBranches(data));
    }
  }, [showForm]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) {
      setErrorMsg("Please provide your name and review details.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          rating,
          comment,
          serviceReceived: selectedService || undefined,
          branch: selectedBranch || undefined
        })
      });

      const resJson = await response.json();
      if (!response.ok) {
        setErrorMsg(resJson.error || "Failed to submit review.");
      } else {
        setSuccessMsg(resJson.message);
        // Reset
        setCustomerName("");
        setRating(5);
        setComment("");
        setSelectedService("");
        setSelectedBranch("");
      }
    } catch (err) {
      setErrorMsg("Error submitting review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 py-4 animate-fadeIn">
      
      {/* Testimonials Display */}
      <section className="space-y-8 animate-fadeIn">
        <SectionHeading
          eyebrow="Client experiences"
          title="Guest Feedback"
          description="Approved reviews shared by guests who visited Elora Beauty studios."
        />

        {reviewsLoading ? (
          <LoadingSkeleton count={3} />
        ) : reviewsError ? (
          <EmptyState title="Reviews unavailable" description={reviewsError} />
        ) : reviews.length === 0 ? (
          <EmptyState
            title="No approved reviews yet"
            description="Approved client experiences will appear here once published."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => {
              const matchedService = services.find((s) => s.id === rev.serviceReceived);
              const matchedBranch = branches.find((b) => b.id === rev.branch);

              return (
                <article key={rev.id} className="flex flex-col justify-between rounded-3xl border border-brand-gold/10 bg-white p-6 shadow-card">
                  <div className="space-y-3">
                    {/* Stars */}
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star 
                          key={idx} 
                          className={`h-4 w-4 ${idx < rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`}
                          fill={idx < rev.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>

                    <p className="mt-2 text-sm font-light italic leading-7 text-stone-600">
                      “{rev.comment}”
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-xs">{rev.customerName}</h4>
                      <p className="text-[9px] text-stone-400 font-mono">
                        {rev.submittedAt ? new Date(rev.submittedAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      {matchedService && (
                        <span className="block text-[10px] font-semibold uppercase text-brand-gold-dark">
                          {matchedService.name.replace("Professional ", "").replace("Luxury ", "").split(",")[0]}
                        </span>
                      )}
                      {matchedBranch && (
                        <span className="mt-1 block text-[9px] text-stone-400">
                          {matchedBranch.name.replace("Elora Beauty - ", "")}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Review Submission Form */}
      {showForm && <section className="bg-[#FAF8F5] border border-[#C5A059]/20 rounded-3xl p-6 md:p-10 max-w-2xl mx-auto space-y-6 shadow-md">
        <div className="space-y-1 text-center">
          <span className="inline-flex items-center text-[10px] font-mono tracking-wider uppercase text-brand-gold-dark font-bold">
            <MessageSquareCode className="w-3 h-3 mr-1 inline" /> Share your experience
          </span>
          <h3 className="font-serif text-2xl font-bold text-stone-900">Write a Review</h3>
          <p className="text-stone-500 text-xs font-light">Your feedback is saved for staff approval before it appears on the website.</p>
        </div>

        {successMsg && (
          <div role="status" aria-live="polite" className="p-4 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-700 rounded-r-xl flex items-start text-sm">
            <Check className="w-5 h-5 mr-2 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div role="alert" className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl flex items-start text-sm">
            <AlertCircle className="mr-1.5 h-5 w-5 shrink-0 text-red-500" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="review-name" className="block text-xs font-semibold text-stone-700 mb-1">Your Name *</label>
              <input
                id="review-name"
                name="customerName"
                type="text"
                autoComplete="name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your full name"
                className="w-full p-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/45"
              />
            </div>
            <div>
              <label htmlFor="review-branch" className="block text-xs font-semibold text-stone-700 mb-1">Studio Visited</label>
              <select
                id="review-branch"
                name="branch"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/45"
              >
                <option value="">Select branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name.replace("Elora Beauty - ", "")}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="review-service" className="block text-xs font-semibold text-stone-700 mb-1">Treatment Received</label>
              <select
                id="review-service"
                name="service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/45"
              >
                <option value="">Select treatment</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <span id="review-rating-label" className="block text-xs font-semibold text-stone-700 mb-1">Rating</span>
              <div role="radiogroup" aria-labelledby="review-rating-label" className="flex items-center space-x-1.5 h-11 bg-white border border-stone-300 rounded-xl px-3 justify-center">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      role="radio"
                      aria-checked={rating === starVal}
                      aria-label={`${starVal} star${starVal > 1 ? "s" : ""}`}
                      className="rounded p-1 cursor-pointer transition transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-dark"
                    >
                      <Star 
                        className={`w-5 h-5 ${starVal <= rating ? "text-amber-400 fill-amber-400" : "text-stone-300"}`} 
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="review-comment" className="block text-xs font-semibold text-stone-700 mb-1">Review Details *</label>
            <textarea
              id="review-comment"
              name="comment"
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your visit, stylist, treatment quality, or salon experience..."
              className="w-full p-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]/45"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-ink py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-brand-gold-dark disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-dark"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Submitting Review..." : "Submit Review"}</span>
          </button>
        </form>
      </section>}

    </div>
  );
}
