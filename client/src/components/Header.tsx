import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary text-2xl">
            <path d="M12 2v1"></path>
            <path d="M12 21v1"></path>
            <path d="m4.93 4.93 .7.7"></path>
            <path d="m18.36 18.36 .7.7"></path>
            <path d="M2 12h1"></path>
            <path d="M21 12h1"></path>
            <path d="m4.93 19.07 .7-.7"></path>
            <path d="m18.36 5.64 .7-.7"></path>
            <circle cx="12" cy="12" r="4"></circle>
          </svg>
          <h1 className="text-2xl font-sans font-bold text-neutral-900">AI Cartoon Creator</h1>
        </div>
        <div>
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <path d="M12 17h.01"></path>
            </svg>
            Help
          </Button>
        </div>
      </div>
    </header>
  );
}
