"use client";

import { Button } from "@/components/ui";
import {
  CheckCircleIcon,
  CodeBracketIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function Home() {
  const handleGetStarted = () => {
    toast.success("Welcome to JKTech Frontend!");
  };

  const features = [
    {
      icon: <CodeBracketIcon className="h-8 w-8" />,
      title: "TypeScript Ready",
      description:
        "Built with TypeScript for type safety and better developer experience.",
    },
    {
      icon: <CogIcon className="h-8 w-8" />,
      title: "Modern Stack",
      description:
        "Next.js 15, React 19, Tailwind CSS, and enterprise-grade tooling.",
    },
    {
      icon: <CheckCircleIcon className="h-8 w-8" />,
      title: "Production Ready",
      description:
        "ESLint, Prettier, and best practices configured out of the box.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">JKTech Frontend</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern, enterprise-grade Next.js application built with
            TypeScript, Tailwind CSS, and industry best practices.
          </p>
          <Button onClick={handleGetStarted} size="lg">
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Tech Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              "Next.js 15",
              "React 19",
              "TypeScript",
              "Tailwind CSS",
              "ESLint",
              "Prettier",
              "Axios",
              "Zod",
            ].map((tech) => (
              <div
                key={tech}
                className="bg-gray-50 rounded-lg p-4 font-medium text-gray-700"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-600">
          <p>Built with ❤️ using modern web technologies</p>
        </footer>
      </div>
    </div>
  );
}
