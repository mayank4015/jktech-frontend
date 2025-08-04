import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 sm:py-20 md:py-24 lg:py-32">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block">Document Management</span>
                <span className="block text-blue-600 mt-2">
                  with AI-Powered Q&A
                </span>
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 sm:text-xl md:text-2xl leading-relaxed">
                Transform how you interact with your documents. Upload,
                organize, and extract meaningful insights using our advanced
                RAG-based question answering system powered by cutting-edge AI
                technology.
              </p>

              {/* Key benefits */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
                    Intelligent Processing
                  </div>
                  <p className="text-gray-700">
                    Advanced AI algorithms automatically extract and index
                    content from your documents for instant searchability.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
                    Natural Language Q&A
                  </div>
                  <p className="text-gray-700">
                    Ask questions in plain English and get precise answers with
                    source references from your document library.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
                    Secure & Scalable
                  </div>
                  <p className="text-gray-700">
                    Enterprise-grade security with role-based access control and
                    unlimited document storage capacity.
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/login">
                  <Button className="w-full sm:w-auto flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto flex items-center justify-center px-10 py-4 border-2 border-blue-600 text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 !text-blue-600 hover:!text-blue-700"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  Trusted by teams at
                </p>
                <div className="flex justify-center items-center space-x-8 text-gray-400">
                  <span className="font-semibold">Enterprise Corp</span>
                  <span className="font-semibold">Tech Solutions</span>
                  <span className="font-semibold">Global Industries</span>
                  <span className="font-semibold">Innovation Labs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to manage documents
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Upload, organize, and extract insights from your documents with
              our powerful platform.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  {/* Icon */}
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Document Management
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Upload, organize, and manage all your documents in one place.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  {/* Icon */}
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  AI-Powered Q&A
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Ask questions and get answers based on your document content.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  {/* Icon */}
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  User Management
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Manage users and control access to your documents.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  {/* Icon */}
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                  Document Processing
                </p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Automatically process and extract information from your
                  documents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
