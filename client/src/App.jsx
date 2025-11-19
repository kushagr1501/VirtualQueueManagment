import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Home from "./components/Home";
import QueuePage from "./components/QueuePage";
import AdminAddPlace from "./components/AdminAddPlace";
import AdminPanel from "./components/AdminPanel";
import BusinessLogin from "./components/BusinessLogin";
import BusinessSignup from "./components/BusinessSignup";
import VerifyUser from "./components/VerifyUser";
import MyQueues from "./components/MyQueues";
function App() {
  return (
  
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/place/:id" element={<QueuePage />} />
        <Route path="/admin/add-place" element={<AdminAddPlace />} />
        <Route path="/admin/place/:id" element={<AdminPanel />} />
        <Route path="/business/signup" element={<BusinessSignup />} />
        <Route path="/business/login" element={<BusinessLogin />} />
        <Route path="/admin/verify" element={<VerifyUser />} />
        <Route path="/my-queues" element={<MyQueues />} />

      </Routes>
  );
}

export default App;
