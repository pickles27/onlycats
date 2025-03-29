import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("An error occurred while fetching cats 😿");
    }
    return res.json();
  });

export function usePosts() {
  const { data, error, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts`,
    fetcher
  );

  return {
    posts: data,
    isLoading: !error && !data,
    errorMessage: error?.message,
    mutate,
  };
}
