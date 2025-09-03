import React, { useState, useEffect, useRef } from 'react';

const DailyOSAbout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sectionsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = document.documentElement.scrollTop;
      const progress = (scrolled / scrollTotal) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            const staggeredItems = entry.target.querySelectorAll('.staggered-item');
            staggeredItems.forEach((item, index) => {
              item.style.transitionDelay = `${index * 0.1}s`;
              item.classList.add('visible');
            });
          } else {
            entry.target.classList.remove('visible');
            const staggeredItems = entry.target.querySelectorAll('.staggered-item');
            staggeredItems.forEach((item) => {
              item.classList.remove('visible');
            });
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    closeMobileMenu();
  };

  return (
    <div className="bg-[#121212] font-sans text-gray-200 antialiased overflow-x-hidden min-h-screen">
      {/* Custom styles for the glassmorphism effect and animations */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        body {
          font-family: 'Poppins', sans-serif;
          background: #121212;
          background: radial-gradient(circle at 10% 20%, rgba(204, 219, 232, 0.05) 0%, rgba(254, 189, 189, 0.05) 90%), #121212;
          animation: backgroundAnimation 20s infinite alternate;
        }

        @keyframes backgroundAnimation {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.3s ease-in-out;
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-5px);
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
        }

        .fluid-heading {
          font-size: clamp(2.5rem, 1.5rem + 3vw, 4rem);
        }

        .fluid-text {
          font-size: clamp(1rem, 0.8rem + 1vw, 1.25rem);
        }

        /* Fade-in animation for sections */
        .fade-in-section {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 1s ease-out, transform 0.8s ease-out;
        }
        
        .fade-in-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Staggered fade-in for list items and cards */
        .staggered-item {
          opacity: 0;
          transform: translateY(10px);
        }
        
        .staggered-item.visible {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.6s ease-out, transform 0.5s ease-out;
        }
        
        .mobile-menu-link {
          transition: transform 0.3s ease, color 0.3s ease;
        }

        .mobile-menu-link:hover {
          transform: scale(1.05);
        }

        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #121212;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #4a4a4a;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #6a6a6a;
        }
        
        .logo-animation {
          position: relative;
          width: 32px;
          height: 32px;
          perspective: 1000px;
        }
        
        .logo-shape {
          width: 100%;
          height: 100%;
          position: absolute;
          transform-style: preserve-3d;
          transform: rotateX(45deg) rotateY(45deg);
          animation: spin 8s infinite linear;
        }
        
        .logo-face {
          position: absolute;
          width: 100%;
          height: 100%;
          background: rgba(96, 165, 250, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        .logo-face-1 { transform: rotateY(0deg) translateZ(16px); }
        .logo-face-2 { transform: rotateY(90deg) translateZ(16px); }
        .logo-face-3 { transform: rotateY(180deg) translateZ(16px); }
        .logo-face-4 { transform: rotateY(270deg) translateZ(16px); }
        .logo-face-5 { transform: rotateX(90deg) translateZ(16px); }
        .logo-face-6 { transform: rotateX(-90deg) translateZ(16px); }
        
        @keyframes spin {
          from { transform: rotateX(45deg) rotateY(0deg); }
          to { transform: rotateX(45deg) rotateY(360deg); }
        }
        `}
      </style>

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 z-50" style={{ width: `${scrollProgress}%` }}></div>

      {/* Header */}
      <header className="fixed w-full z-40 glass-card transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* 3D Logo */}
          <a href="#" className="flex items-center space-x-2 rounded-lg p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <div className="logo-animation">
              <div className="logo-shape">
                <div className="logo-face logo-face-1"></div>
                <div className="logo-face logo-face-2"></div>
                <div className="logo-face logo-face-3"></div>
                <div className="logo-face logo-face-4"></div>
                <div className="logo-face logo-face-5"></div>
                <div className="logo-face logo-face-6"></div>
              </div>
            </div>
            <span className="text-xl font-bold text-white tracking-wider">DailyOS</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <a onClick={(e) => scrollToSection(e, 'mission')} href="#mission" className="text-gray-200 hover:text-blue-400 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md">Mission</a>
            <a onClick={(e) => scrollToSection(e, 'features')} href="#features" className="text-gray-200 hover:text-blue-400 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md">Features</a>
            <a onClick={(e) => scrollToSection(e, 'why-unique')} href="#why-unique" className="text-gray-200 hover:text-blue-400 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md">Why DailyOS</a>
            <a onClick={(e) => scrollToSection(e, 'contact')} href="#contact" className="text-gray-200 hover:text-blue-400 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-md">Contact</a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              id="mobile-menu-button"
              className="p-2 rounded-lg text-blue-400 glass-card focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={toggleMobileMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <nav
          id="mobile-menu"
          className={`md:hidden w-full glass-card border-t border-gray-700 py-4 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col items-center space-y-4">
            <a onClick={(e) => scrollToSection(e, 'mission')} href="#mission" className="block text-gray-200 hover:text-blue-400 transition-colors duration-300 mobile-menu-link">Mission</a>
            <a onClick={(e) => scrollToSection(e, 'features')} href="#features" className="block text-gray-200 hover:text-blue-400 transition-colors duration-300 mobile-menu-link">Features</a>
            <a onClick={(e) => scrollToSection(e, 'why-unique')} href="#why-unique" className="block text-gray-200 hover:text-blue-400 transition-colors duration-300 mobile-menu-link">Why DailyOS</a>
            <a onClick={(e) => scrollToSection(e, 'contact')} href="#contact" className="block text-gray-200 hover:text-blue-400 transition-colors duration-300 mobile-menu-link">Contact</a>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 mb-24">
        {/* Hero Section */}
        <section className="text-center py-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight fluid-heading">
            DailyOS — Your Personal Operating System for Students
          </h1>
          <p className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto fluid-text">
            Manage time, money, tasks, and goals — all in one student-first OS.
          </p>
        </section>

        {/* Mission Section */}
        <section 
          id="mission"
          ref={(el) => (sectionsRef.current[0] = el)}
          className="mt-16 p-8 rounded-xl glass-card fade-in-section"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">Our Mission & Vision</h2>
          <div className="mt-6 text-gray-300 fluid-text space-y-4">
            <p className="staggered-item">
              At DailyOS, our mission is to empower students worldwide by providing a comprehensive, intuitive, and affordable platform to manage their academic and personal lives. We believe that with the right tools, every student can achieve their full potential, reduce stress, and focus on what truly matters: learning and personal growth.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li className="staggered-item">We provide a comprehensive, intuitive, and affordable platform.</li>
              <li className="staggered-item">We enable students to manage academic and personal lives in one place.</li>
              <li className="staggered-item">We help reduce stress and foster personal growth.</li>
              <li className="staggered-item">We're committed to creating tools that simplify complexity.</li>
              <li className="staggered-item">Our vision is a future where every student has a companion that promotes a balanced life.</li>
            </ul>
          </div>
        </section>

        {/* Key Features Section */}
        <section 
          id="features"
          ref={(el) => (sectionsRef.current[1] = el)}
          className="mt-16 p-8 rounded-xl glass-card fade-in-section"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="p-6 rounded-lg glass-card hover:bg-gray-800 staggered-item">
              <h3 className="font-semibold text-white text-lg">Academic Planner</h3>
              <p className="text-gray-400 mt-2">Track class schedules, assignments, and exam dates with smart reminders.</p>
            </div>
            <div className="p-6 rounded-lg glass-card hover:bg-gray-800 staggered-item">
              <h3 className="font-semibold text-white text-lg">Financial Tracker</h3>
              <p className="text-gray-400 mt-2">Manage budgets, expenses, and student loans effortlessly with interactive charts.</p>
            </div>
            <div className="p-6 rounded-lg glass-card hover:bg-gray-800 staggered-item">
              <h3 className="font-semibold text-white text-lg">Task & Project Manager</h3>
              <p className="text-gray-400 mt-2">Organize all your to-dos, from simple errands to complex group projects.</p>
            </div>
            <div className="p-6 rounded-lg glass-card hover:bg-gray-800 staggered-item">
              <h3 className="font-semibold text-white text-lg">Goal Setting</h3>
              <p className="text-gray-400 mt-2">Set and track personal and academic goals with built-in progress visualization.</p>
            </div>
          </div>
        </section>

        {/* Why DailyOS is Unique Section */}
        <section 
          id="why-unique"
          ref={(el) => (sectionsRef.current[2] = el)}
          className="mt-16 p-8 rounded-xl glass-card fade-in-section"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">Why DailyOS is Unique</h2>
          <div className="mt-6 text-gray-300 fluid-text space-y-4">
            <p className="staggered-item">
              **Built for Students, by Students:** Unlike generic apps, DailyOS is designed from the ground up to solve real student problems, not just add another to-do list to your life.
            </p>
            <p className="staggered-item">
              **All-in-One Simplicity:** Our platform seamlessly integrates everything you need to manage. No more jumping between different apps for your calendar, budget, and assignments.
            </p>
            <p className="staggered-item">
              **Focus-First Design:** Our clean, distraction-free interface helps you stay on track and get things done without the extra cognitive load.
            </p>
            <p className="staggered-item">
              **Tailored to Your Journey:** Our features understand the complexities of student life, from managing a part-time job to saving for a study abroad trip.
            </p>
          </div>
        </section>

        {/* Our Impact Section */}
        <section 
          id="impact"
          ref={(el) => (sectionsRef.current[3] = el)}
          className="mt-16 p-8 rounded-xl glass-card fade-in-section"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">Our Impact</h2>
          <p className="mt-6 text-gray-300 fluid-text">
            Since our beta launch, we have helped thousands of students streamline their lives. Our users report significant reductions in academic-related anxiety, improved grades, and a better grasp of their personal finances. We are proud to be a part of their success stories, one organized day at a time.
          </p>
        </section>

        {/* Closing Note */}
        <section 
          id="closing-note"
          ref={(el) => (sectionsRef.current[4] = el)}
          className="mt-16 p-8 rounded-xl glass-card fade-in-section"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">A Closing Note</h2>
          <p className="mt-6 text-gray-300 fluid-text">
            Thank you for considering DailyOS. We are more than just an app; we are a community dedicated to helping you succeed. We are excited for you to join us on this journey.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="py-8 text-center glass-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-wide">Contact Us</h2>
          <ul className="list-none space-y-2 mb-4 text-gray-400">
            <li>General Inquiries: <a href="mailto:info@dailyos.com" className="text-blue-400 hover:underline">info@dailyos.com</a></li>
            <li>Support & Feedback: <a href="mailto:support@dailyos.com" className="text-blue-400 hover:underline">support@dailyos.com</a></li>
            <li>Press & Partnerships: <a href="mailto:press@dailyos.com" className="text-blue-400 hover:underline">press@dailyos.com</a></li>
          </ul>
          <p className="text-gray-500">&copy; 2024 DailyOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DailyOSAbout;
