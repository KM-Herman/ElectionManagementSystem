import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">🗳️</span>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Electra
                            </span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
                            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">How it Works</a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="px-5 py-2.5 text-gray-700 font-medium hover:text-blue-600 transition-colors">
                                Login
                            </Link>
                            <Link to="/signup" className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-20">
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 -z-10"></div>
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute -bottom-8 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-36 text-center">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 animate-fadeIn">
                            Voting made <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Secure</span> & <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Simple</span>.
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10 leading-relaxed animate-slideUp">
                            Experience the future of democracy with our blockchain-inspired, transparent election platform.
                            Vote from anywhere, securely and instantly.
                        </p>
                        <div className="flex justify-center flex-col sm:flex-row gap-4 animate-slideUp delay-100">
                            <Link to="/signup" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
                                Register to Vote
                            </Link>
                            <Link to="/login" className="px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                                View Demo
                            </Link>
                        </div>
                    </div>
                </div>

                <div id="features" className="py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Key Features</h2>
                            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                                Why Choose Electra?
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <FeatureCard
                                icon="🔒"
                                title="Bank-Grade Security"
                                description="Your vote is encrypted and secured using industry-standard protocols. Privacy is our top priority."
                            />
                            <FeatureCard
                                icon="⚡"
                                title="Real-Time Results"
                                description="Watch the election unfold with live, automated result updates. No more waiting days for the count."
                            />
                            <FeatureCard
                                icon="📱"
                                title="Accessible Anywhere"
                                description="Vote from your phone, tablet, or computer. Our platform is designed for everyone, everywhere."
                            />
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <div id="how-it-works" className="py-24 bg-gray-50 border-t border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Process</h2>
                            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                                How to Vote in 3 Steps
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <StepCard number="1" title="Register" description="Create an account using your email and verify your identity securely." />
                            <StepCard number="2" title="Vote" description="Browse candidates, review their manifestos, and cast your secure vote." />
                            <StepCard number="3" title="Track" description="Watch the live results as they come in. Transparency guaranteed." />
                        </div>
                    </div>
                </div>

                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <span className="text-2xl">🗳️</span>
                            <span className="text-lg font-bold text-gray-500">E-Voting</span>
                        </div>
                        <p className="text-gray-500 text-sm">© 2025 E-Voting Systems. All rights reserved.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10 hover:bg-white transition-all duration-300">
        <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed">
            {description}
        </p>
    </div>
);

const StepCard = ({ number, title, description }: { number: string, title: string, description: string }) => (
    <div className="relative p-6">
        <div className="w-12 h-12 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-blue-500/30">
            {number}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
    </div>
);
