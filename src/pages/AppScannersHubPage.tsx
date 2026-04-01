export {
  type LiveSignalSentiment,
  type LiveSignalType,
  type LiveTimeHorizon,
  type LiveMarketSignal,
} from "@/components/scanner/AppScannersHubMarketSections";

export function AppScannersHubPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-primary/[0.03] to-background pb-24 md:pb-12">
      <div className="max-w-lg lg:max-w-6xl mx-auto px-4 pt-4 sm:pt-6">
        <header className="mb-5 lg:mb-8">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h1 className="text-[28px] sm:text-[32px] lg:text-[36px] font-bold text-foreground tracking-tight leading-[1.12]">
                <span className="lg:inline block">Find your next trade </span>
                <span className="lg:inline block text-[#542087]">in seconds.</span>
              </h1>
              <p className="text-[13px] sm:text-[14px] lg:text-[15px] text-muted-foreground mt-3 leading-snug line-clamp-2 lg:max-w-xl">
                80+ ready scans. Build your own with 300+ indicators.
              </p>
            </div>
          </div>
        </header>
            </div>
    </div>
  );
}
