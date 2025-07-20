import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signin } from "./components/Signin";
import { Signup } from "./components/Signup";

import "./App.css";
import { Dashboard } from "./components/DashBoard";
export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Signin />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
