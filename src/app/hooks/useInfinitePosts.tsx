"use client";

import useSWRInfinite from "swr/infinite";

const LIMIT = 10;

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
  const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite(
    getKey,
    fetcher,
    {
      initialSize: 1,
      revalidateAll: false,
    }
  );

  const posts = data ? data.flat() : [];
  const isReachingEnd = data && data[data.length - 1]?.length === 0;

  return {
    posts,
    errorMessage: error?.message,
    isLoading,
    size,
    setSize,
    mutate,
    isReachingEnd,
  };
}
