import Image from "next/image";
import { PostLikes } from "./PostLikes";

interface PostProps {
  postId: string;
  imageUrl: string;
  likes: number;
}

export const Post = ({ postId, imageUrl, likes }: PostProps) => {
  return (
    <div className="relative">
      <Image
        alt="A picture of a cat"
        className="w-full aspect-square object-cover overflow-clip rounded-md"
        src={imageUrl}
        width={300}
        height={300}
      />
      <PostLikes postId={postId} likes={likes} />
    </div>
  );
};
