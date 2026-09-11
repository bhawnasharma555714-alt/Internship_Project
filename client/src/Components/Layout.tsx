import type { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
}

function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#0B0F17]">
            <div className="max-w-2xl lg:max-w-6xl mx-auto px-6 py-8">
                {children}
            </div>
        </div>
    );
}

export default Layout;