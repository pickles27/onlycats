"use client";

import useSWRInfinite from "swr/infinite";

// Using 18 because it's divisible by 1, 2, and 3
// Then there are no gaps on last row
const LIMIT = 18;

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("An error occurred while fetching cats 😿");
  }
  const data = await res.json();
  return data;
};

const getKey = (pageIndex: number, previousPageData: any) => {
  if (previousPageData && !previousPageData.length) {
    return null;
  }

  return `${process.env.NEXT_PUBLIC_API_URL}/api/posts?page=${
    pageIndex + 1
  }&limit=${LIMIT}`;
};

export function useInfinitePosts() {
  const { data, error, size, setSize, mutate, isValidating, isLoading } =
    useSWRInfinite(getKey, fetcher, {
      initialSize: 1,
      revalidateAll: false,
    });

  const posts = data
    ? data.flat().map((post) => ({
        blurDataUrl: post.blur_data_url,
        caption: post.caption,
        createdAt: post.created_at,
        imageUrl: post.image_url,
        likes: post.likes,
        postId: post.post_id,
      }))
    : [];
  const isReachingEnd = data && data[data.length - 1]?.length < LIMIT;

  return {
    posts,
    errorMessage: error?.message,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
    isReachingEnd,
  };
}
