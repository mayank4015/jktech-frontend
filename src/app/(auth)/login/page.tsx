import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { isAuthenticated } from "@/app/actions/auth";

// Mark this page as dynamic since it uses cookies for authentication
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // If authenticated, redirect to dashboard
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">JKTech</h1>
          <p className="mt-2 text-sm text-gray-600">
            Document Management & Q&A System
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
