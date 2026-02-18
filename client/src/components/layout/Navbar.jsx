import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-lg">
                        E
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">EventHorizon</span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="#" className="text-gray-300 hover:text-white transition text-sm font-medium">Discover</Link>
                    <Link to="#" className="text-gray-300 hover:text-white transition text-sm font-medium">Pricing</Link>
                    <Link to="#" className="text-gray-300 hover:text-white transition text-sm font-medium">About</Link>
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className="text-white hover:text-gray-200 font-medium text-sm">Sign In</Link>
                    <Link to="/signup" className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition">
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-black/95 border-b border-white/10 p-4 absolute w-full">
                    <div className="flex flex-col gap-4">
                        <Link to="#" className="text-gray-300 hover:text-white">Discover</Link>
                        <Link to="#" className="text-gray-300 hover:text-white">Pricing</Link>
                        <Link to="#" className="text-gray-300 hover:text-white">About</Link>
                        <hr className="border-white/10" />
                        <Link to="/login" className="text-white">Sign In</Link>
                        <Link to="/signup" className="bg-white text-black px-4 py-2 rounded-full font-bold text-center">
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
