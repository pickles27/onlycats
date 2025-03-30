"use client";

import { useEffect, useRef } from "react";
import { useInfinitePosts } from "../hooks/useInfinitePosts";
import { PostSkeleton } from "./PostSkeleton";
import { Post } from "./Post";
import Button from "@mui/material/Button";

export const Posts = () => {
  const { posts, isLoading, errorMessage, setSize, isReachingEnd } =
    useInfinitePosts();

  if (errorMessage) {
    return <p role="alert">{errorMessage}</p>;
  }

  return (
    <>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 15 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))
          : posts.map((post: any) => (
              <div key={post.post_id}>
                <Post
                  caption={post.caption}
                  imageUrl={post.image_url}
                  likes={post.likes}
                  postId={post.post_id}
                />
              </div>
            ))}
      </div>
      <div className="mt-4">
        {
          <Button
            disabled={isReachingEnd}
            variant="contained"
            onClick={() => setSize((size) => size + 1)}
          >
            {isReachingEnd ? "No More Cats 😿" : "Load More"}
          </Button>
        }
      </div>
    </>
  );
};
