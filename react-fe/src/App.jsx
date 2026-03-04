import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chatbot from "./Chatbot";

function App() {
  const handleShopClick = () => {
    window.scrollTo({ top: 600, behavior: "smooth" });
  };

  return (
    <Router>
      <>
        <Routes>
          <Route path="/" element={<Home onShopClick={handleShopClick} />} />
        </Routes>

        {/* Chatbot floats on all pages */}
        <Chatbot />
      </>
    </Router>
  );
}

export default App;
