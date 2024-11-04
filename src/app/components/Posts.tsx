import Image from "next/image";

export const dynamic = "force-dynamic";

export const Posts = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`);

  if (!response.ok) {
    return (
      <div className="w-full h-full justify-center items-center">
        Failed to fetch cats.
      </div>
    );
  }

  const posts = await response.json();

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 space-between">
      {posts.map((post: any) => (
        <Image
          key={post.post_id}
          alt="A picture of a cat"
          className="w-full aspect-square object-cover overflow-clip rounded-md"
          src={post.image_url}
          width={300}
          height={300}
        />
      ))}
    </div>
  );
};
