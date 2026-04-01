import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickScannerSection, type QuickScreenerSnapshot } from "@/components/scanner/mobile/QuickScannerSection";
import { CustomScannerPage } from "./CustomScannerPage";

export function DIYScreenerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as { quickFullScreen?: boolean; quickSnapshot?: QuickScreenerSnapshot } | null) ?? null;
  if (state?.quickFullScreen) {
    return (
      <main className="mx-auto w-full max-w-[1200px] px-4 py-4 lg:px-6 lg:py-6">
        <div className="mb-3 flex items-center gap-2 border-b border-[#F1F1F1] pb-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[#262626]"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <p className="text-[16px] font-semibold text-[#262626]">Custom Screener</p>
        </div>
        <QuickScannerSection fullScreen initialState={state?.quickSnapshot} />
      </main>
    );
  }
  return <CustomScannerPage />;
}
