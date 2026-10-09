import React from "react";
import { createRoot } from "react-dom/client";
import BirthdayExperience from "@/components/birthday/experience";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BirthdayExperience />
  </React.StrictMode>,
);
