import React from 'react';

const Loader = () => {
    return (
        <div className="flex h-screen bg-[#100D1A] flex-col items-center justify-center font-sans overflow-hidden">

            {/* Central Animated Loader Area */}
            <div className="relative flex items-center justify-center mb-10 h-32 w-32">

                {/* Outer glowing aura */}
                <div className="absolute w-44 h-44 bg-purple-600/20 rounded-full blur-xl animate-pulse"></div>

                {/* Outer spinning dashed ring */}
                <div className="absolute w-32 h-32 border-[3px] border-transparent border-t-purple-500 border-r-purple-500 rounded-full animate-[spin_2s_linear_infinite]"></div>
                <div className="absolute w-32 h-32 border-[3px] border-transparent border-b-purple-600/30 border-l-purple-600/30 rounded-full animate-[spin_2s_linear_infinite]"></div>

                {/* Middle spinning solid ring (slower, opposite direction) */}
                <div className="absolute w-28 h-28 border-4 border-purple-800/60 rounded-full"></div>
                <div className="absolute w-28 h-28 border-[4px] border-transparent border-t-purple-400 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>

                {/* Inner static solid circle with pulse effect */}
                <div className="w-10 h-10 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-pulse"></div>
                <div className="absolute w-14 h-14 bg-purple-500/20 rounded-full animate-ping"></div>

            </div>

            {/* Text Area */}
            <div className="flex flex-col items-center space-y-3 z-10">
                <h2 className="text-2xl font-bold text-purple-400 animate-pulse tracking-wide">
                    Processing...
                </h2>
                <p className="text-gray-400 text-sm font-medium">
                    Preparing your premium experience
                </p>
            </div>

            {/* Bouncing Dots */}
            <div className="flex space-x-2 mt-12 z-10">
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"></div>
            </div>

        </div>
    );
};

export default Loader;
