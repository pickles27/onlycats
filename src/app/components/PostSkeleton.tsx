import Skeleton from "@mui/material/Skeleton";

export const PostSkeleton = () => (
  <figure className="w-full aspect-square flex justify-center rounded-md overflow-hidden drop-shadow-md">
    <Skeleton
      variant="rectangular"
      className="w-full min-h-full aspect-square object-cover overflow-clip"
    />
  </figure>
);
