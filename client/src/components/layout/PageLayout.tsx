import { ReactNode } from "react";
import Header from "@/components/dashboard/Header";
import { FadeIn } from "@/components/ui/fade-in";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  onRefresh?: () => void;
}

export default function PageLayout({ children, title, description, onRefresh }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onRefresh={onRefresh || (() => {})} />
      
      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="mt-2 text-sm lg:text-base text-gray-600">{description}</p>
              )}
            </div>
          </FadeIn>
          
          {children}
        </div>
      </main>
    </div>
  );
}