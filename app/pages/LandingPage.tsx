import { motion } from "framer-motion";
import { useState } from "react";
import { 
  FileText, 
  Edit3, 
  Users, 
  Zap, 
  ArrowRight, 
  Check,
  Menu,
  X
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Rich Content Editor",
      description: "Create beautiful articles with our markdown-powered editor and live preview."
    },
    {
      icon: <Edit3 className="w-6 h-6" />,
      title: "Tree Structure",
      description: "Organize content hierarchically with parent-child relationships for easy navigation."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User Management",
      description: "Secure authentication and user roles to control who can create and edit content."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Built with modern tech stack for optimal performance and user experience."
    }
  ];

  const benefits = [
    "Intuitive user interface",
    "Advanced content organization",
    "Mobile-responsive design",
    "SEO optimization built-in",
    "Custom themes and branding"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* TraibeTech Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                    <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900">
                    Traibe<span className="text-green-500">Tech</span>
                  </span>
                  <span className="text-xs text-gray-500 -mt-1">Intelligence. Innovation. Impact.</span>
                </div>
              </div>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">Benefits</a>
              <button onClick={onGetStarted} className="text-gray-600 hover:text-gray-900 transition-colors">Register</button>
              <motion.button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-white border-t border-gray-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900">Features</a>
              <a href="#benefits" className="block text-gray-600 hover:text-gray-900">Benefits</a>
              <button onClick={onGetStarted} className="block text-gray-600 hover:text-gray-900">Register</button>
              <button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full font-medium"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              className="inline-block mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                CONTENT MANAGEMENT SYSTEM
              </span>
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8"
              {...fadeInUp}
            >
              Content creation
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                you'll enjoy.
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Everything you need to manage content for your
              blog posts, articles, and marketing pages.
              Generate pages based on CMS entries and easily
              update content across your site.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Start for free</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
             
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 180, 360] 
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-lg opacity-20"
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -180, -360] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Dead simple.
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Surprisingly powerful.
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              With a simple interface, you can easily add, edit, and delete your
              content as needed without having to jump into the design canvas.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              {...fadeInUp}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">
                Everything you need to
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {" "}manage content
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Make it easy for anyone, such as your clients or team, to edit the site.
                Use filters and transforms to modify the data and display it on the canvas.
              </p>
              <motion.div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-600 to-emerald-600"></div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <motion.div
                  className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" as any }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            {...fadeInUp}
          >
            Ready to transform your content?
          </motion.h2>
          <motion.p 
            className="text-xl text-green-100 mb-8"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            Join thousands of creators who trust our platform for their content management needs.
          </motion.p>
          <motion.button
            onClick={onGetStarted}
            className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 inline-flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <span>Get Started Today</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <span className="text-xl font-bold">
                Traibe<span className="text-green-500">Tech</span>
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 TraibeTech. Intelligence. Innovation. Impact.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
