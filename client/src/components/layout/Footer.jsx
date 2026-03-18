import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, ShieldCheck, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-black border-t border-white/10 pt-16 pb-8 px-6 text-white font-sans mt-20">
            <div className="max-w-7xl mx-auto">
                {/* Top Feature Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
                    <div className="flex flex-col items-start gap-4">
                        <div className="p-4 bg-purple-900/20 rounded-2xl">
                            <Headphones className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">24/7 Customer Care</h4>
                            <p className="text-gray-400 text-sm mt-1">We are here to help you 24/7</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-4">
                        <div className="p-4 bg-purple-900/20 rounded-2xl">
                            <ShieldCheck className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Secure Booking Confirmation</h4>
                            <p className="text-gray-400 text-sm mt-1">Get your tickets instantly</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-4">
                        <div className="p-4 bg-purple-900/20 rounded-2xl">
                            <Mail className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Subscribe to the Newsletter</h4>
                            <p className="text-gray-400 text-sm mt-1">Stay updated with latest events</p>
                        </div>
                    </div>
                </div>

                <hr className="border-white/5 mb-10" />

                {/* Explore Top Cities */}
                <div className="mb-10">
                    <h5 className="font-semibold text-sm mb-4">Explore Top Cities</h5>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
                        <Link to="#" className="hover:text-white transition-colors">Mumbai</Link>
                        <Link to="#" className="hover:text-white transition-colors">Delhi NCR</Link>
                        <Link to="#" className="hover:text-white transition-colors">Chennai</Link>
                        <Link to="#" className="hover:text-white transition-colors">Bengaluru</Link>
                        <Link to="#" className="hover:text-white transition-colors">Hyderabad</Link>
                        <Link to="#" className="hover:text-white transition-colors">Pune</Link>
                        <Link to="#" className="hover:text-white transition-colors">Ahmedabad</Link>
                        <Link to="#" className="hover:text-white transition-colors">Kolkata</Link>
                        <Link to="#" className="hover:text-white transition-colors">Kochi</Link>
                    </div>
                </div>

                {/* Quick Event Reference */}
                <div className="mb-10">
                    <h5 className="font-semibold text-sm mb-4">Quick Event Reference</h5>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
                        <Link to="#" className="hover:text-white transition-colors">Comedy shows in Pune</Link>
                        <Link to="#" className="hover:text-white transition-colors">Events happening Tomorrow</Link>
                        <Link to="#" className="hover:text-white transition-colors">Events happening This Weekend</Link>
                    </div>
                </div>

                <hr className="border-white/5 mb-10" />

                {/* Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    <div className="flex flex-col gap-3">
                        <h5 className="font-semibold text-sm mb-2">Events</h5>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Music Shows</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Workshops</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Kids</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Comedy Shows</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Exhibitions</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Online Streaming Events</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Meetups</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Nightlife</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Food Festivals</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">New Year</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Kids Activities</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Awards Shows</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Talks</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Screenings</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h5 className="font-semibold text-sm mb-2">More Events</h5>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Concerts</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Festivals</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Education</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Parties</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Fitness</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Music Festivals</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Entertainment</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Gaming</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Health & Wellness</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Pop culture events</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Film Making</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h5 className="font-semibold text-sm mb-2">More Categories</h5>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Gaming</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Photography</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Health & Fitness</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Shopping</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Food & Drinks</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Technology</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Books & Literature</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Environment</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Anime</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Writing</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h5 className="font-semibold text-sm mb-2">Festivo</h5>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Festivo in Mumbai</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Festivo in Delhi</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Festivo in Bengaluru</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Festivo in Hyderabad</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Festivo in Pune</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Festivo in Chennai</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Festivo in Kolkata</Link>
                        <Link to="#" className="text-xs text-gray-400 hover:text-white transition-colors">Festivo in Ahmedabad</Link>
                    </div>
                </div>

                <hr className="border-white/5 mb-6" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                            <span className="font-bold text-white text-xs">F</span>
                        </div>
                        <p className="text-xs text-gray-500">© 2024 Festivo All rights reserved.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors" />
                        <div className="w-6 h-6 rounded-full bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors" />
                        <div className="w-6 h-6 rounded-full bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors" />
                        <div className="w-6 h-6 rounded-full bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
