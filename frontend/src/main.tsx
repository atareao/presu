import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {  GlobalWorkerOptions } from "pdfjs-dist";
import { pdfjs } from 'react-pdf';
import App from '@/App';
import "@fontsource/inter/400.css"; // Peso normal
import "@fontsource/inter/700.css"; // Peso negrita

const workerUrl = `/assets/workers/pdf.worker.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  workerUrl,
  import.meta.url,
).toString();
GlobalWorkerOptions.workerSrc = `/assets/workers/pdf.worker.mjs`;

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

