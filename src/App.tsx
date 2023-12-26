import { MainRefferalModal } from "./components";

export default function App() {
  let url: unknown;

  if (typeof window !== "undefined") {
    url = window.location.origin + window.location.pathname;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      {/* <div className="w-full h-[100vh]"> */}
      <MainRefferalModal url={url} />
      {/* </div> */}
    </div>
  );
}
