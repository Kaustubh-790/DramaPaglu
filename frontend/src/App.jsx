import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MyList from "./pages/MyList";
import Discover from "./pages/Discover";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-20 px-4 md:px-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mylist" element={<MyList />} />
            <Route path="/discover" element={<Discover />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
