import { Posts } from "./components/Posts";

const Home = async () => {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Posts />
    </main>
  );
};

export default Home;
