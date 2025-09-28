import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';

const Header = () => {
  const { userdata } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isNewUser, setIsNewUser] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    // Check localStorage for signup flag
    const justSignedUp = localStorage.getItem('justSignedUp') === 'true';
    const justLoggedIn = localStorage.getItem('justLoggedIn') === 'true';
    
    if (justSignedUp) {
      setIsNewUser(true);
      localStorage.removeItem('justSignedUp');
    } else if (justLoggedIn) {
      setIsReturningUser(true);
      localStorage.removeItem('justLoggedIn');
    }
  }, [userdata]);

  const handleExploreClick = () => {
    if (userdata) {
      navigate('/home');
    } else {
      navigate('/signup');
    }
  };

  // Safe user name extraction
  const getUserFirstName = () => {
    if (!userdata?.user?.name) return '';
    return userdata.user.name.split(' ')[0];
  };

  // Dynamic content based on user status
  const getGreeting = () => {
    if (!userdata) return "Ready to explore blogs?";
    if (userdata.user?.isGuest) return "Welcome, Guest Reader!";
    if (isNewUser) return `Great to see you, ${getUserFirstName()}!`;
    if (isReturningUser) return `Welcome back, ${getUserFirstName()}!`;
    return `Welcome to BlogHub, ${getUserFirstName()}!`;
  };

  const getSubheadline = () => {
    if (!userdata) return "Join thousands of readers and writers in our trusted blogging community. Discover, share, and connect through meaningful content.";
    if (userdata.user?.isGuest) return "Experience our blogging platform as a guest. Read amazing articles and see how we connect writers and readers.";
    if (isNewUser) return "Your writing journey starts here! Publish your first post and join our creative community.";
    if (isReturningUser) return "Continue your blogging journey! Check your stats and discover new stories.";
    return "Join thousands of readers and writers in our trusted blogging community. Discover, share, and connect through meaningful content.";
  };

  const getPrimaryButtonText = () => {
    if (!userdata) return "Get Started - Free";
    if (userdata.user?.isGuest) return "Create Account to Start Writing";
    if (isNewUser) return "Write Your First Post";
    if (isReturningUser) return "Continue Reading";
    return "Explore Blogs";
  };

  const getBenefits = () => {
    const baseBenefits = !userdata || userdata.user?.isGuest 
      ? [
          "📖 Preview amazing articles",
          "✍️ See writing potential",
          "🛡️ Safe and moderated content",
          "🚀 Fast publishing",
          "⭐ Build your reader reputation",
          "📱 Easy content discovery"
        ]
      : [
          "📖 Read from verified writers with quality content",
          "✍️ Share your stories with millions of readers",
          "🛡️ Safe and respectful community",
          "🚀 Quick publishing and editing",
          "⭐ Rate articles and build your author reputation",
          "📱 Easy writing and content management"
        ];
    
    return baseBenefits;
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden min-h-screen flex items-center">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-48 h-48 md:w-72 md:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 md:right-32 w-64 h-64 md:w-96 md:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-10 md:left-40 w-56 h-56 md:w-80 md:h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative w-full py-8 md:py-16 px-4 md:px-6 mt-14 md:mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            
            {/* Left Content Section */}
            <div className="text-center lg:text-left">
              {/* Greeting Badge */}
              <div className="mb-6 animate-fadeIn flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 max-w-max">
                  <div className="bg-green-400 p-1 rounded-full">
                    <span className="text-lg">📝</span>
                  </div>
                  <h4 className="text-lg md:text-xl font-semibold">
                    {getGreeting()}
                  </h4>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent block">
                  Your Ultimate Blogging
                </span>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block mt-2">
                  Read & Write With Passion
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {getSubheadline()}
              </p>

              {/* Key Benefits - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0">
                {getBenefits().map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-200 text-sm md:text-base">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleExploreClick}
                  className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold text-base md:text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {getPrimaryButtonText()}
                </button>
                
                {!userdata && (
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-semibold text-base md:text-lg hover:bg-white/20 transition-all duration-300"
                  >
                    Existing User? Login
                  </button>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/10">
                {[
                  { number: "100+", label: "Active Writers" },
                  { number: "500+", label: "Articles Published" },
                  { number: "95%", label: "Happy Readers" },
                  { number: "24/7", label: "Support" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-blue-300">{stat.number}</div>
                    <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Illustration Section */}
            <div className="flex justify-center items-center mt-8 lg:mt-0">
              <div className="relative w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 transform hover:scale-105 transition duration-300">
                  <div className="text-center mb-4 md:mb-6">
                    <div className="text-4xl mb-3 md:mb-4">📚</div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">
                      {userdata ? "Ready to Explore?" : "Join Our Blogging Community!"}
                    </h3>
                    <p className="text-gray-300 text-sm md:text-base">
                      {userdata ? 
                       "Read thousands of articles or write your own!" : 
                       "Start your reading and writing journey today!"}
                    </p>
                  </div>
                  
                  {/* Quick Features */}
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    {[
                      !userdata || userdata.user?.isGuest ? "✓ Create account for full access" : "✓ Premium features for first 10 posts",
                      "✓ Writer protection program",
                      "✓ Easy content management",
                      "✓ Fast publishing options"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-300">
                        <span className="text-green-400 mr-2">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleExploreClick}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 text-sm md:text-base"
                  >
                    {!userdata ? 'Start Writing Today' :
                     userdata.user?.isGuest ? 'Sign Up Free' : 'Go to Blog Hub'}
                  </button>
                </div>

                {/* Floating Elements */}
                {userdata && !userdata.user?.isGuest && (
                  <>
                    <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-yellow-400 text-yellow-900 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold animate-bounce">
                      Trending 🔥
                    </div>
                    <div className="absolute -bottom-2 -left-2 md:-bottom-4 md:-left-4 bg-green-400 text-green-900 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold">
                      Verified ✅
                    </div>
                  </>
                )}
                
                {userdata?.user?.isGuest && (
                  <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-blue-400 text-blue-900 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold">
                    Guest Mode 👀
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile CTA for Guest Users */}
          {userdata?.user?.isGuest && (
            <div className="lg:hidden mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
              <div className="text-center">
                <h3 className="text-lg md:text-xl font-bold mb-2">Ready to Read or Write?</h3>
                <p className="text-gray-300 mb-4 text-sm md:text-base">Create an account to access all blogging features</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/signup')}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg font-semibold text-sm md:text-base"
                  >
                    Sign Up Free
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex-1 py-3 bg-white/10 border border-white/20 rounded-lg font-semibold text-sm md:text-base"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-12 md:mt-16 text-center">
            <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">Trusted by writers and readers worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 opacity-60">
              {["Top Rated Writers", "Quality Content", "Reader Protection", "Fast Publishing", "24/7 Support"].map((feature, index) => (
                <div key={index} className="flex items-center space-x-1 text-gray-300 text-sm">
                  <span className="text-green-400">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;