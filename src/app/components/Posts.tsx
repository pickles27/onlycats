import { Post } from "./Post";

export interface PostsProps {
  posts: { postId: number; imageUrl: string }[];
}

export const Posts = ({ posts }: PostsProps) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 space-between">
      {posts.map((post) => (
        <Post key={post.postId} imageUrl={post.imageUrl} />
      ))}
    </div>
  );
};
