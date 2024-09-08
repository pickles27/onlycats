/* eslint-disable @next/next/no-img-element */
import { Posts } from "./components/Posts";

const posts = [
  {
    postId: 0,
    imageUrl:
      "https://preview.redd.it/look-at-my-best-buddy-could-he-get-any-cuter-v0-kvc47wiopend1.jpeg?width=1080&crop=smart&auto=webp&s=9d099b1bdc105bec96c38c6b562ca895f457cc3f",
  },
  {
    postId: 1,
    imageUrl:
      "https://preview.redd.it/it-took-a-whole-day-before-either-of-our-cats-seized-the-v0-s6hnnyqe5hnd1.jpeg?auto=webp&s=9da3d46b2e6146b3f645603ae176144c74e6611e",
  },
  {
    postId: 2,
    imageUrl:
      "https://preview.redd.it/im-working-with-my-cat-v0-4e76xnacv5nd1.jpeg?auto=webp&s=d391486ce17e2e159084e072f417a0d9cbaab92e",
  },
  {
    postId: 3,
    imageUrl:
      "https://preview.redd.it/hunting-moment-v0-i4kr5o0916nd1.jpeg?auto=webp&s=bf36d2224928030bbce480c63f55625affd16dce",
  },
];

const Home = async () => {
  return (
    <main className="flex min-h-screen flex-col items-center px-8 md:px-24 pt-8">
      <div className="w-full flex items-center gap-2 mb-6">
        <img
          alt="cat logo"
          className="w-8 md:w-10 h-8 md:h-10 object-contain"
          src="../cat.png"
        />
        <h1 className="text-sky-500 font-bold text-2xl md:text-3xl">
          OnlyCats
        </h1>
      </div>
      <Posts posts={posts} />
    </main>
  );
};

export default Home;
