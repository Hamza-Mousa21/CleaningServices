import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./container/Home";
import LoginPage from "./container/login";
import Booking from "./container/booking"
import "./style.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/booking" element={<Booking></Booking>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;