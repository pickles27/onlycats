"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import NumberFlow from "@number-flow/react";
import toast from "react-hot-toast";
import { usePosts } from "../hooks/usePosts";

export interface PostLikesProps {
  postId: string;
  likes: number;
}

export const PostLikes = ({ postId, likes }: PostLikesProps) => {
  const [animate, setAnimate] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean | undefined>(undefined);
  const { mutate } = usePosts();

  const localStorageKey = `isLiked-${postId}`;

  const handleClick = async () => {
    try {
      // Reset any ongoing animation so the user can trigger a new one.
      setAnimate(false);
      // Re-trigger the animation on next tick.
      setTimeout(() => setAnimate(true), 10);
      const response = await fetch("/api/like/post", {
        method: "POST",
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        throw new Error();
      }

      localStorage.setItem(localStorageKey, "true");
      setIsLiked(true);
      mutate();
    } catch (error) {
      toast.error("Unable to like post right now 😿");
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (animate) {
      // Remove the animation class after 2 seconds.
      timeout = setTimeout(() => setAnimate(false), 1000);
    }
    return () => clearTimeout(timeout);
  }, [animate]);

  useEffect(() => {
    try {
      const isPreviouslyLiked =
        localStorage.getItem(localStorageKey) === "true";
      if (isPreviouslyLiked) {
        setIsLiked(true);
      }
    } catch (error) {
      console.error("error occurred while accessing local storage: ", error);
    }
  }, [localStorageKey]);

  return (
    <div className="absolute bottom-2 right-2 flex items-center gap-2">
      <NumberFlow
        className="text-white text-xl opacity-90"
        format={{ notation: "compact" }}
        value={likes}
      />
      <button className="w-6 h-6" onClick={handleClick} aria-label="like">
        <svg
          fill={isLiked ? "pink" : "none"}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={2}
          viewBox="0 0 24 24"
          className={clsx("w-6 h-6 cursor-pointer opacity-80", {
            "animate-like": animate,
          })}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09 
                 C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                 c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      </button>
    </div>
  );
};
