"use client";

import { usePosts } from "../hooks/usePosts";
import { PostSkeleton } from "./PostSkeleton";
import { Post } from "./Post";

export const Posts = () => {
  const { posts, isLoading, errorMessage } = usePosts();

  if (errorMessage) {
    return <p role="alert">{errorMessage}</p>;
  }

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 space-between">
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
  );
};
