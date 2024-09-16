import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full h-screen relative">
      <div className="text-4xl text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Image src="/logoSvg.svg" width={400} height={400} alt="logo" className="mb-4" />
        FileGilla
      </div>
    </div>
  );
}
