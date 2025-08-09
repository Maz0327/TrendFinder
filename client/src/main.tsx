import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { errorLogger } from "./lib/errorLogger";

// Initialize global error logging
errorLogger;

createRoot(document.getElementById("root")!).render(<App />);
