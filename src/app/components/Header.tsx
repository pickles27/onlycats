import { UploadButton } from "./UploadButton";
import catIcon from "public/cat.svg";
import Image from "next/image";

export const Header = () => (
  <div className="w-full flex justify-between items-center gap-2 mb-4 sm:mb-6">
    <div className="flex items-center gap-1">
      <Image alt="cat icon" src={catIcon} />
      <h1 className="text-sky-600 text-3xl font-bold drop-shadow-sm">
        OnlyCats
      </h1>
    </div>
    <UploadButton />
  </div>
);
