import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";

// Lazy load pages to reduce main bundle size
const Redelivery = lazy(() => import("./pages/Redelivery"));
const DELieferung = lazy(() => import("./pages/DELieferung"));
const DKLevering = lazy(() => import("./pages/DKLevering"));
const ITRiconsegna = lazy(() => import("./pages/ITRiconsegna"));
const FRLivraison = lazy(() => import("./pages/FRLivraison"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="text-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Loading...</p></div></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/invoice/:code" element={<Redelivery />} />
              <Route path="/de/lieferung" element={<DELieferung />} />
              <Route path="/de/lieferung/:code" element={<DELieferung />} />
              <Route path="/invoice/de/lieferung/:code" element={<DELieferung />} />
              <Route path="/dk/levering" element={<DKLevering />} />
              <Route path="/dk/levering/:code" element={<DKLevering />} />
              <Route path="/invoice/dk/levering/:code" element={<DKLevering />} />
              <Route path="/levering/:code" element={<DKLevering />} />
              <Route path="/it/riconsegna" element={<ITRiconsegna />} />
              <Route path="/it/riconsegna/:code" element={<ITRiconsegna />} />
              <Route path="/invoice/it/riconsegna/:code" element={<ITRiconsegna />} />
              <Route path="/riconsegna/:code" element={<ITRiconsegna />} />
              <Route path="/fr/livraison" element={<FRLivraison />} />
              <Route path="/fr/livraison/:code" element={<FRLivraison />} />
              <Route path="/invoice/fr/livraison/:code" element={<FRLivraison />} />
              <Route path="/livraison/:code" element={<FRLivraison />} />
              <Route path="/redelivery/:code" element={<Redelivery />} />
              <Route path="/:code" element={<FRLivraison />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
