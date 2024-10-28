import { TailSpin } from "react-loading-icons";

const Loading = () => {
  return (
    <main className="flex cc min-h-screen">
      <TailSpin
        stroke="#ffffff"
        strokeWidth={2}
        width={200}
        height={200}
        speed={2}
      />
    </main>
  );
};

export default Loading;
