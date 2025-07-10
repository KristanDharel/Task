import { useState } from "react";
import "./App.css";
import Login from "./component/Login";
import SignupForm from "./component/Register";
import MyRoute from "./router/MyRoute";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <MyRoute />
      
    </>
  );
}

export default App;
