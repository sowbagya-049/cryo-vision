import { Snowflake, Github, Menu } from 'lucide-react';

export function Header() {
    return (
        <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg backdrop-blur-md">
                            <Snowflake className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Cryo-Vision AI
                            </h1>
                            <p className="text-xs text-blue-100 font-medium">
                                Cold Chain Intelligence OS
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <a
                            href="#dashboard"
                            className="text-sm font-medium hover:text-blue-200 transition-colors"
                        >
                            Dashboard
                        </a>
                        <a
                            href="#analytics"
                            className="text-sm font-medium hover:text-blue-200 transition-colors"
                        >
                            Analytics
                        </a>
                        <a
                            href="https://github.com/sowbagya-049/cryo-vision"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all backdrop-blur-md"
                        >
                            <Github className="w-4 h-4" />
                            <span className="text-sm font-medium">GitHub</span>
                        </a>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
}
