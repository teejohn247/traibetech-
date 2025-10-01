import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, FileText, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";

interface LoginProps {
  onBack?: () => void;
}

export default function Login({ onBack }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 180, 360] 
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-24 h-24 bg-blue-200 rounded-lg opacity-20"
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -180, -360] 
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <motion.div
        className="absolute top-1/2 right-20 w-16 h-16 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full opacity-30"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          {onBack && (
            <motion.button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
              whileHover={{ x: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:text-green-600 transition-colors" />
              <span className="group-hover:text-green-600 transition-colors">Back to home</span>
            </motion.button>
          )}

          {/* Auth Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden"
            {...fadeInUp}
          >
            {/* Card Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-emerald-600"></div>
            
            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              {...fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center relative">
                  <FileText className="w-8 h-8 text-white" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-3 h-3 text-yellow-600" />
                  </motion.div>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isSignUp ? "Join CMS Pro" : "Welcome back"}
              </h2>
              <p className="text-gray-600">
                {isSignUp 
                  ? "Create your account and start managing content like a pro" 
                  : "Sign in to continue to your dashboard"
                }
              </p>
            </motion.div>

            {/* Form */}
            <motion.form 
              onSubmit={handleAuth} 
              className="space-y-6"
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <motion.input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <motion.input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    whileFocus={{ scale: 1.02 }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Message */}
              {message && (
                <motion.div 
                  className={`text-center text-sm p-3 rounded-xl ${
                    message.includes("Check your email") 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {message}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" as any }}
                  />
                )}
                {loading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" as any }}
                    />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </div>
                ) : (
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                )}
              </motion.button>

              {/* Toggle Auth Mode */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-gray-600 hover:text-gray-900 font-medium relative group"
                >
                  <span className="relative z-10">
                    {isSignUp
                      ? "Already have an account? Sign in"
                      : "Need an account? Sign up"}
                  </span>
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-600 to-emerald-600 origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
              </div>
            </motion.form>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="text-center mt-8 text-sm text-gray-500"
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
