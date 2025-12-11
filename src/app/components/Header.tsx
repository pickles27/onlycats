import { UploadButton } from "./UploadButton";
import catIcon from "../../../public/cat.svg";
import Image from "next/image";
import Link from "next/link";

export const Header = () => (
  <div className="fixed top-0 z-50 bg-white w-full flex justify-between items-center gap-2 py-3 px-4 sm:px-12 lg:px-16 border-b-sky-600">
    <Link className="flex items-center gap-1" href="/">
      <Image alt="cat icon" src={catIcon} />
      <h1 className="text-sky-600 text-3xl font-bold drop-shadow-sm">
        OnlyCats
      </h1>
    </Link>
    <UploadButton />
  </div>
);
