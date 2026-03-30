import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { ScannerLibraryPage } from "@/pages/ScannerLibraryPage";
import { ScannerDetailPage } from "@/pages/ScannerDetailPage";
import { DIYScreenerPage } from "@/pages/DIYScreenerPage";
import { MarketplacePage } from "@/pages/MarketplacePage";
import { MarketplaceDetailPage } from "@/pages/MarketplaceDetailPage";
import { AlertsDashboardPage } from "@/pages/AlertsDashboardPage";
import { CreatorProfilePage } from "@/pages/CreatorProfilePage";
import { DiyUiSamplesPage } from "@/pages/DiyUiSamplesPage";
import { AppScannersHubPage } from "@/pages/AppScannersHubPage";
import { MobileScannerPage } from "@/pages/MobileScannerPage";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/app/scanners" element={<AppScannersHubPage />} />
          <Route path="/app/scanners/mobile" element={<MobileScannerPage />} />
          <Route path="/scanners" element={<ScannerLibraryPage />} />
          <Route path="/scanners/:id" element={<ScannerDetailPage />} />
          <Route path="/diy" element={<DIYScreenerPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/:id" element={<MarketplaceDetailPage />} />
          <Route path="/alerts" element={<AlertsDashboardPage />} />
          <Route path="/profile/:username" element={<CreatorProfilePage />} />
          <Route path="/_ui/diy-options" element={<DiyUiSamplesPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
