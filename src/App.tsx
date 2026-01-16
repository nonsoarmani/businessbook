import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import ScriptConverterPage from "./pages/ScriptConverter"; // Import the new main page
import { ScriptConverterProvider } from "./state/scriptConverterStore"; // Import the new store

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <ScriptConverterProvider> {/* Wrap the entire app with the new provider */}
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ScriptConverterPage />} /> {/* Set ScriptConverterPage as the default route */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ScriptConverterProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;