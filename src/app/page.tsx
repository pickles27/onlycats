/* eslint-disable @next/next/no-img-element */
import { Posts } from "./components/Posts";
import { UploadButton } from "./components/UploadButton";

const Home = async () => {
  return (
    <main className="flex min-h-screen flex-col items-center px-8 md:px-24 pt-8">
      <div className="w-full flex justify-between items-center gap-2 mb-6">
        <div className="flex">
          <img
            alt="cat logo"
            className="w-8 md:w-10 h-8 md:h-10 object-contain"
            src="../cat.png"
          />
          <h1 className="text-sky-500 font-bold text-2xl md:text-3xl">
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
