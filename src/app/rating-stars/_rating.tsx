"use client";
import RatingStars from "@/components/rating-stars/rating-stars";
import { useState } from "react";

export function Rating() {
  const [rating, setRating] = useState(0);
  return (
    <section className="my-12">
      <RatingStars rating={rating} setRating={setRating} />
      <div className="my-6 font-semibold">Applied Rating: {rating}</div>
    </section>
  );
}
