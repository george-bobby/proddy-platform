import { Canvas } from "./_components/canvas";
import { Room } from "@/components/room";
import { Loading } from "./_components/loading";

type CanvasIdPageProps = {
  params: {
    canvasId: string;
  };
};

const CanvasIdPage = ({ params }: CanvasIdPageProps) => {
  return (
    <Room roomId={params.canvasId} fallback={<Loading />}>
      <Canvas canvasId={params.canvasId} />
    </Room>
  );
};

export default CanvasIdPage;
