import { useEffect } from "react";
import { Controls } from "./components/Controls";
import { Gallery } from "./components/Gallery";
import { Stage } from "./components/Stage";
import { Topbar } from "./components/Topbar";
import { useStudio } from "./store";

export function App() {
  const screen = useStudio((s) => s.screen);
  const boot = useStudio((s) => s.boot);

  useEffect(() => {
    boot();
  }, [boot]);

  return (
    <div className="flex h-dvh flex-col bg-bg text-ink">
      <Topbar />
      <main className="flex min-h-0 flex-1 max-[900px]:flex-col-reverse min-[901px]:flex-row">
        {screen === "gallery" ? (
          <Gallery />
        ) : (
          <>
            <Controls />
            <Stage />
          </>
        )}
      </main>
    </div>
  );
}
