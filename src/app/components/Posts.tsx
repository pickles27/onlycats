"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInfinitePosts } from "../hooks/useInfinitePosts";
import { PostSkeleton } from "./PostSkeleton";
import { LoadingDots } from "./LoadingDots";
import { Post } from "./Post";

export const Posts = () => {
  const {
    posts,
    errorMessage,
    setSize,
    isLoading,
    isValidating,
    isReachingEnd,
  } = useInfinitePosts();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoading && !isReachingEnd) {
        setSize((size: number) => size + 1);
      }
    },
    [isLoading, isReachingEnd, setSize]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver);
    const currentRef = observerRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleObserver]);

  if (errorMessage) {
    return <p role="alert">{errorMessage}</p>;
  }

  return (
    <>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && posts.length === 0
          ? Array.from({ length: 15 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))
          : posts.map((post) => (
              <div key={post.postId}>
                <Post {...post} />
              </div>
            ))}
      </div>
      <div ref={observerRef} className="h-4 mt-4"></div>
      {isValidating && (
        <div className="flex justify-center">
          <LoadingDots />
        </div>
      )}
    </>
  );
};
