/* eslint-disable @next/next/no-img-element */

export interface PostProps {
  imageUrl: string;
}

export const Post = ({ imageUrl }: PostProps) => (
  <img
    alt="A picture of a cat"
    className="w-full aspect-square object-cover overflow-clip"
    src={imageUrl}
  />
);
