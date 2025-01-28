import Floats from "./components/Floats";
import { Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden select-none">
      <Floats
        color="bg-green-500"
        size="w-56 h-56"
        top="-5%"
        left="10%"
        delay={0}
      />
      <Floats
        color="bg-emerald-500"
        size="w-42 h-42"
        top="70%"
        left="80%"
        delay={5}
      />
      <Floats
        color="bg-lime-500"
        size="w-28 h-28"
        top="40%"
        left="-10%"
        delay={2}
      />

      <Routes>
        <Route path="/" element={"Home"} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={EmailVerificationPage} />
      </Routes>
    </div>
  );
}

export default App;
