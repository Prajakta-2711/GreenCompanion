import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import and add custom fonts
const fontLinkElement = document.createElement("link");
fontLinkElement.rel = "stylesheet";
fontLinkElement.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap";
document.head.appendChild(fontLinkElement);

// Add page title
const titleElement = document.createElement("title");
titleElement.textContent = "PlantPal - Smart Plant Care";
document.head.appendChild(titleElement);

createRoot(document.getElementById("root")!).render(<App />);
