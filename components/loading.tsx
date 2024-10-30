import { TailSpin } from "react-loading-icons";

interface props {
  width?: number;
  height?: number;
  stroke?: number;
  color?: string;
}

const Loading: React.FC<props> = ({ width, height, stroke, color }) => {
  return (
    <main className="flex cc min-h-screen">
      <TailSpin
        stroke={color ? color : "#ffffff"}
        strokeWidth={stroke ? stroke : 2}
        width={width ? width : 200}
        height={height ? height : 200}
        speed={2}
      />
    </main>
  );
};

export default Loading;
