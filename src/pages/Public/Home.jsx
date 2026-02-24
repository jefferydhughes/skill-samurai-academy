import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Rocket, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  Code2,
  Gamepad2,
  Trophy,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, useScroll, useTransform } from 'framer-motion';
import LocationFinder from '../../components/locations/LocationFinder';

export default function Home() {
  const [user, setUser] = useState(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    loadUser();

    // Load Elfsight script
    const script = document.createElement('script');
    script.src = 'https://elfsightcdn.com/platform.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (e) {}
  };

  const { data: programs = [] } = useQuery({
    queryKey: ['featuredPrograms'],
    queryFn: () => api.entities.Program.filter({ active: true }, '-created_date', 3),
  });

  const features = [
    {
      icon: Code2,
      title: 'Visual Block Coding',
      description: 'Learn programming concepts through intuitive drag-and-drop blocks',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'from-blue-500/10 via-cyan-500/10 to-transparent'
    },
    {
      icon: Gamepad2,
      title: '3D Voxel Worlds',
      description: 'Build and explore interactive 3D worlds as you code',
      color: 'from-violet-500 to-purple-500',
      gradient: 'from-violet-500/10 via-purple-500/10 to-transparent'
    },
    {
      icon: Trophy,
      title: 'Gamified Learning',
      description: 'Earn achievements and track progress through fun challenges',
      color: 'from-amber-500 to-orange-500',
      gradient: 'from-amber-500/10 via-orange-500/10 to-transparent'
    }
  ];



  const stats = [
    { value: '10K+', label: 'Happy Students' },
    { value: '95%', label: 'Completion Rate' },
    { value: '4.9/5', label: 'Parent Rating' },
    { value: '50+', label: 'Programs' }
  ];

  return (
    <div className="relative">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/dr76535kj/image/upload/v1771936172/Untitled_design_geeauy.png"
                alt="Kitsune OS"
                className="w-9 h-9 object-contain"
              />
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Kitsune OS
              </span>
            </div>
            {user ? (
              <Button
                asChild
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl"
              >
                <Link to={createPageUrl(
                  user.role === 'teacher' ? 'TeacherPortal' :
                  user.role === 'admin' || user.role === 'location_manager' ? 'AdminDashboard' :
                  user.role === 'student' ? 'LearningWorlds' :
                  'ParentDashboard'
                )}>
                  My Dashboard
                </Link>
              </Button>
            ) : (
              <Button
                onClick={() => api.auth.redirectToLogin()}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Full Height with Animated Gradient */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-cyan-50 to-indigo-100">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
          </div>
        </div>

        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="mb-6 px-4 py-2 bg-white/80 backdrop-blur-xl text-indigo-700 border border-indigo-200/50 shadow-lg shadow-indigo-500/10">
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  AI-Powered Learning Platform
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-[1.1]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Where Kids Learn to
                <motion.span 
                  className="block bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent mt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Code & Create Worlds
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-slate-600 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Interactive 3D coding adventures for ages 8-12. 
                Build voxel worlds while mastering real programming concepts.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button 
                  size="lg"
                  asChild
                  className="group relative bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-500/70 transition-all px-10 py-7 text-lg rounded-2xl hover:scale-105 overflow-hidden"
                >
                  <Link to={createPageUrl('ProgramsBrowser')}>
                    <span className="relative z-10 flex items-center">
                      Explore Programs
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>
                {user && (
                  <Button 
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-2 border-slate-300 hover:bg-white/80 backdrop-blur-xl px-8 py-7 text-lg rounded-2xl hover:scale-105 transition-all"
                  >
                    <Link to={createPageUrl('LearningWorlds')}>
                      <Rocket className="w-5 h-5 mr-2" />
                      Continue Learning
                    </Link>
                  </Button>
                )}
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                {stats.map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Floating Device Mockup with Video */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden lg:flex justify-center items-center"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                {/* MacBook Mockup with Video */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-3" style={{ width: '360px', height: '640px' }}>
                  <div className="rounded-xl overflow-hidden w-full h-full">
                    <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src="https://blip.game/videos/demo.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
                
                {/* Floating Badge - Overlaying the video */}
                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-20 top-24 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/50 z-10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Achievement!</div>
                      <div className="text-xs text-slate-600">Level completed</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Mobile Video - Shows below hero text on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative lg:hidden mt-12 flex justify-center"
            >
              <div className="relative w-full max-w-[360px]">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-3" style={{ aspectRatio: '9/16' }}>
                  <div className="rounded-xl overflow-hidden w-full h-full">
                    <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover"
                    >
                      <source src="https://blip.game/videos/demo.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
                
                {/* Floating Badge - Overlaying the video */}
                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-16 top-16 bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-xl border border-white/50 z-10"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Achievement!</div>
                      <div className="text-[10px] text-slate-600">Level completed</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-slate-400/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-slate-400/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Location Finder Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LocationFinder />
        </div>
      </section>

      <div className="space-y-32 pb-32">

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 border-0">
            <Zap className="w-4 h-4 mr-2" />
            Why Choose Us
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            A New Way to Learn Coding
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Our unique approach combines game-based learning with real computer science fundamentals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="group relative h-full">
                  {/* Glassmorphism Card */}
                  <div className="relative h-full rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 overflow-hidden p-8">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <motion.div 
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Google Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 px-4 py-2 bg-emerald-100 text-emerald-700 border-0">
            <Star className="w-4 h-4 mr-2" />
            Reviews
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Loved by Parents & Educators
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Join thousands of families already transforming their child's future
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="elfsight-app-cf1022f9-057b-412c-80c5-dc45f2627a93" data-elfsight-app-lazy></div>
        </motion.div>
      </section>

      {/* What Skill Samurai Offers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-4 px-4 py-2 bg-violet-100 text-violet-700 border-0">
            <BookOpen className="w-4 h-4 mr-2" />
            Our Programs
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            What Skill Samurai Offers
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Weekly Classes */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8 }}
          >
            <Link to={createPageUrl('ProgramsBrowser')} className="block group h-full">
              <div className="h-full rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 via-violet-500 to-purple-600 flex items-center justify-center">
                    <span className="text-6xl">💻</span>
                  </div>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                    Weekly Classes
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Our hands-on classes give kids the chance to explore game design, robotics, AI, app development, and more — all personalized to their age, interests, and learning style.
                  </p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl group/btn"
                  >
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </div>
            </Link>
          </motion.div>

          {/* Holiday Camps */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            whileHover={{ y: -8 }}
          >
            <Link to={createPageUrl('CampBrowser')} className="block group h-full">
              <div className="h-full rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
                    <span className="text-6xl">🎓</span>
                  </div>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                    Holiday Camps
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Designed to be an innovative art, science, and technology-based program for students ages 8-16 our camp provides a one-of-a-kind, all-inclusive holiday camp experience unlike any other.
                  </p>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    For 10 years, our company has been delivering creative camps worldwide to 15,000+ students offering unique programming for the entire family.
                  </p>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Campers will have an unforgettable week making new friends and learning new skills.
                  </p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl group/btn"
                  >
                    View camps
                    <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 md:p-20"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob" />
            <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-10 left-1/2 w-32 h-32 bg-purple-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000" />
          </div>
          
          <div className="relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="mb-6 px-5 py-2.5 bg-white/20 backdrop-blur-xl text-white border border-white/30 shadow-lg text-base">
                <Clock className="w-5 h-5 mr-2" />
                Limited Spots Available
              </Badge>
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Ready to Start Your Coding Journey?
            </motion.h2>
            
            <motion.p 
              className="text-xl md:text-2xl text-indigo-100 max-w-2xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Join thousands of young coders building the future, one block at a time.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                size="lg" 
                className="group bg-white text-indigo-600 hover:bg-indigo-50 shadow-2xl hover:shadow-white/40 px-12 py-8 text-xl rounded-2xl hover:scale-105 transition-all"
                onClick={() => !user && api.auth.redirectToLogin()}
                asChild={!!user}
              >
                {user ? (
                  <Link to={createPageUrl('MyChildren')}>
                    <Sparkles className="w-6 h-6 mr-3" />
                    Get Started Free
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    Get Started Free
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div 
              className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/80"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>100% Safe & Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>Free Trial Available</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
