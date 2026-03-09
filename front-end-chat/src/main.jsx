import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.jsx";
import AppRoutes from "./config/routes.jsx";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "./context/ChatContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster position="bottom-center"></Toaster>
    <ChatProvider>
      <AppRoutes></AppRoutes>
    </ChatProvider>
  </BrowserRouter>,
);
