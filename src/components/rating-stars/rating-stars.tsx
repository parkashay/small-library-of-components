"use client";

import { useState } from "react";

export default function RatingStars({
  rating,
  setRating,
}: {
  rating: number;
  setRating: React.Dispatch<React.SetStateAction<number>>;
}) {
  const ratingStatus = ["Bad", "Fair", "Good", "Very Good", "Excellent"];
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => handleRatingChange(star)}
          onMouseOver={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
          className="relative flex items-center justify-center"
        >
          {hoveredStar === star && (
            <span className="absolute  bottom-0 rounded-md text-white bg-slate-800 -translate-y-8 py-1 w-fit whitespace-nowrap text-nowrap px-2 bg-primary flex items-center justify-center">
              {ratingStatus[star - 1]}
              <Triangle className=" fill-slate-800 rotate-180 absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-slate-800" />
            </span>
          )}
          <StarIcon fill={Boolean(star <= rating || star <= hoveredStar)} />
        </button>
      ))}
    </div>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement> | { fill: boolean }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={props.fill ? "#FACC15" : "none"}
      stroke="rgba(153, 153, 153, 0.8)"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function Triangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="20px"
      height="20px"
      viewBox="0 0 512 512"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>triangle-filled</title>
      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="drop" fill="#1E293B" transform="translate(32.000000, 42.666667)">
          <path
            d="M246.312928,5.62892705 C252.927596,9.40873724 258.409564,14.8907053 262.189374,21.5053731 L444.667042,340.84129 C456.358134,361.300701 449.250007,387.363834 428.790595,399.054926 C422.34376,402.738832 415.04715,404.676552 407.622001,404.676552 L42.6666667,404.676552 C19.1025173,404.676552 7.10542736e-15,385.574034 7.10542736e-15,362.009885 C7.10542736e-15,354.584736 1.93772021,347.288125 5.62162594,340.84129 L188.099293,21.5053731 C199.790385,1.04596203 225.853517,-6.06216498 246.312928,5.62892705 Z"
            id="Combined-Shape"
          ></path>
        </g>
      </g>
    </svg>
  );
}
