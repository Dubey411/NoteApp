import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Note from "./components/NoteApp";
import Auth from "./components/Auth";
// import { isAuthenticated } from "./utils/auth";

import "./App.css";

// Simulated authentication check
const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  return isAuthenticated() ? (
    children
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public login route */}
        <Route path="/" element={<Auth />} />

        {/* Protected note route */}
        <Route
          path="/note"
          element={
            <ProtectedRoute>
              <Note />
            </ProtectedRoute>
          }
        />

        {/* Optional: catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
