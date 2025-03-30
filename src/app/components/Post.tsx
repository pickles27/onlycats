import Image from "next/image";
import { PostLikes } from "./PostLikes";

interface PostProps {
  blurDataUrl: string;
  caption: string;
  imageUrl: string;
  likes: number;
  postId: string;
}

export const Post = ({
  blurDataUrl,
  caption,
  imageUrl,
  likes,
  postId,
}: PostProps) => {
  return (
    <figure className="relative rounded-md overflow-hidden drop-shadow-md">
      <Image
        alt={caption}
        className="w-full aspect-square object-cover overflow-clip"
        src={imageUrl}
        width={300}
        height={300}
        placeholder="blur"
        blurDataURL={blurDataUrl}
      />
      <figcaption className="absolute text-xs inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
        <div className="text-white w-2/3 font-medium">{caption}</div>
      </figcaption>
      <PostLikes postId={postId} likes={likes} />
    </figure>
  );
};
