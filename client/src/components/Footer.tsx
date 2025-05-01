export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-300 mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-sans font-semibold text-white mb-4">AI Cartoon Creator</h4>
            <p className="text-sm">Turn your everyday experiences into animated stories with the power of AI.</p>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-white mb-4">Powered By</h4>
            <ul className="text-sm space-y-2">
              <li>Open Source Animation Tools</li>
              <li>Natural Language Processing</li>
              <li>Computer Vision Technology</li>
              <li>Web Audio Processing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-white mb-4">Resources</h4>
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Support</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-neutral-700 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} AI Cartoon Creator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
