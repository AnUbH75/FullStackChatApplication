import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import JoinCreateChat from "./components/JoinCreateChat";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <JoinCreateChat></JoinCreateChat>
    </>
  );
}

export default App;
