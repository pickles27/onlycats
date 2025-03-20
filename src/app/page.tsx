import { Posts } from "./components/Posts";
import { UploadButton } from "./components/UploadButton";
import Image from "next/image";
import catIcon from "public/cat.svg";

const Home = async () => {
  return (
    <main className="flex min-h-screen flex-col items-center px-8 sm:px-12 lg:px-16 pt-8">
      <div className="w-full flex justify-between items-center gap-2 mb-6">
        <div className="flex items-center">
          <Image alt="cat icon" src={catIcon} />
          <h1 className="text-sky-600 text-3xl font-bold drop-shadow-sm">
            OnlyCats
          </h1>
        </div>
        <UploadButton />
      </div>
      <Posts />
    </main>
  );
};

export default Home;
