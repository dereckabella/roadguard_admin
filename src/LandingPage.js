import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Users, Book, CheckCircle, Twitter, Facebook, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import RoadGuard from './images/roadguardlogo.png';
import roadillustration from './images/roadillustration.png';
import { Player } from '@lottiefiles/react-lottie-player';
import protectionAnimation from './lottie/protection.json';
import community from './lottie/community.json'; // Path to your Lottie JSON file
import book from './lottie/book.json'; 
import emailjs from 'emailjs-com';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navItems = ['home', 'about', 'pricing', 'contact'];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const emailData = {
    user_name: formData.name,
    user_email: formData.email,
    user_message: formData.message,
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
  
    setIsSubmitting(true);
  
    const serviceId = 'service_m6cxy9e';  // Your EmailJS service ID
    const templateId = 'template_2hi8it9';  // Your EmailJS template ID
    const userId = 'bENKQCzvMg3hcfLjW';  // Your EmailJS user ID
  
    const emailData = {
      user_name: formData.name,
      user_email: formData.email,
      user_message: formData.message,
    };
  
    console.log('Form Data:', formData);  // Check the form data
  
    emailjs
      .send(serviceId, templateId, emailData, userId)
      .then(
        (response) => {
          console.log('Message sent successfully', response);
          setIsSubmitting(false);
          alert('Message Sent!');
        },
        (error) => {
          console.error('Error sending message', error);
          setIsSubmitting(false);
          alert('Oops! Something went wrong. Please try again.');
        }
      );
  };
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Enhanced Navbar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-900/80 backdrop-blur-md border-b border-gray-800' : 'bg-gray-300' // Light asphalt gray background
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <img src={RoadGuard} alt="RoadGuard Logo" className="h-10 w-auto" />
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="relative text-black-400 hover:text-yellow-400 transition-colors group"
                >
                  <span className="capitalize font-medium">{item}</span>
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </button>
              ))}
            </nav>
            <Link to="/app" className="hidden md:inline-flex items-center px-6 py-2.5 font-semibold text-gray-900 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-400/20 transform hover:-translate-y-0.5">
              Get Started <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          <div className="container mx-auto px-6 py-24 relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-yellow-400/10 rounded-full text-yellow-400 text-sm font-medium">
                  New: Road Safety Updates 2024 🚗
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Your Road Safety
                  <span className="text-yellow-400"> Guardian</span>
                </h1>
                <p className="text-xl text-gray-400 leading-relaxed">
                  Experience safer journeys with real-time alerts and community-driven insights.
                  Stay informed, stay protected.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/app" className="inline-flex items-center justify-center px-8 py-3 bg-yellow-400 text-gray-900 rounded-full hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-400/20 transform hover:-translate-y-0.5">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <button onClick={() => scrollToSection('about')} className="inline-flex items-center justify-center px-8 py-3 bg-gray-800 text-yellow-400 rounded-full hover:bg-gray-700 transition-all duration-300 shadow-lg">
                    Learn More
                  </button>
                </div>
              </div>
              <div className="hidden md:block relative">
  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-3xl transform rotate-6" />
  <img 
    src={roadillustration}  // Use the imported image here
    alt="Road safety illustration" 
    className="relative rounded-3xl shadow-2xl transform hover:-rotate-2 transition-transform duration-500 w-5/6 h-auto"  // Increase the size slightly
  />
</div>




            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-gray-800 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-bold mb-6 text-white">Making Roads Safer Together</h2>
              <p className="text-xl text-gray-400">Join thousands of drivers who trust RoadGuard for their daily commute</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  animation: protectionAnimation, // Replace the icon with the animation
                  title: '24/7 Protection',
                  desc: 'Real-time alerts and continuous monitoring for your safety',
                },
                {
                  animation: community,
                  title: 'Community Driven',
                  desc: 'Powered by a network of vigilant road users',
                },
                {
                  animation: book,
                  title: 'Expert Resources',
                  desc: 'Access to comprehensive safety guides and tips',
                },
              ].map((item, index) => (
                <div key={index} className="p-8 bg-gray-900/50 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-700">
                  {item.animation ? (
                    <Player
                      autoplay
                      loop
                      src={item.animation}
                      className="w-24 h-24 mb-6" // Adjust size here (e.g., w-24 h-24 for 6rem size)
                    />
                  ) : (
                    <item.icon className="w-12 h-12 text-yellow-400 mb-6" />
                  )}
                  <h3 className="text-xl font-semibold mb-4 text-white">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

       {/* Pricing Section */}
<section id="pricing" className="py-24 bg-gray-800">
  <div className="container mx-auto px-6">
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h2 className="text-4xl font-bold mb-6 text-white">Simple, Transparent Pricing</h2>
      <p className="text-xl text-gray-400">Choose the perfect plan for your safety needs</p>
    </div>
    {/* Pricing Plans Container */}
    <div className="flex justify-center space-x-8">
      {[ 
        { name: 'Basic', price: '0', duration: 'Free', features: ['Up to 500 Alerts', 'Ads', 'Post Newsfeed'] },
        { name: 'Pro', price: '100', duration: '1 Month', features: ['Unlimited Alerts Received', '24/7 Support', 'API Access'] },
        { name: 'Pro', price: '500', duration: '6 Months', features: ['Unlimited Alerts Received', '24/7 Support', 'API Access'] },
        { name: 'Pro', price: '1000', duration: '1 Year', features: ['Unlimited Alerts Received', '24/7 Support', 'API Access'] }
      ].map((plan) => (
        <div key={plan.name} className={`w-72 rounded-2xl p-8 ${
          plan.name === 'Pro' ? 'bg-yellow-400 text-gray-900 ring-4 ring-yellow-400/20' : 'bg-gray-900 text-white'
        } transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border border-gray-700`}>
          <h3 className="text-2xl font-semibold text-center mb-4">{plan.name}</h3>
          <div className="text-center mb-6">
            <span className="text-5xl font-bold">₱{plan.price}</span>
            <span className={plan.name === 'Pro' ? 'text-gray-700' : 'text-gray-400'}>/{plan.duration}</span>
          </div>
          <ul className="space-y-4 mb-8">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className={`w-5 h-5 ${
                  plan.name === 'Pro' ? 'text-gray-900' : 'text-yellow-400'
                } mr-2`} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
          to="#"
          onClick={toggleModal} // Trigger the modal
          className="hidden md:inline-flex items-center px-6 py-2.5 font-semibold text-gray-900 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-400/20 transform hover:-translate-y-0.5"
        >
          Get Started <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
        </div>
      ))}
    </div>
  </div>
</section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">Get in Touch</h2>
            <p className="text-xl text-gray-400">We're here to help with any questions about road safety</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                    rows="5"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      </main>

      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-xs w-full">
      <h3 className="text-center text-xl mb-4">Scan the QR Code to Download App</h3>
      <img src={require('./images/QR.png')} alt="QR Code" className="w-full h-auto" />
      <button
        onClick={toggleModal}
        className="w-full mt-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
      >
        Close
      </button>
    </div>
  </div>
)}

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-24 pb-12 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
            <img src={RoadGuard} alt="RoadGuard Logo"  className="h-8 w-auto mb-6" />
              <p className="text-gray-400">Empowering safer journeys through innovation and community.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-4">
              {navItems.map((item) => (
                  <li key={item}>
                    <button onClick={() => scrollToSection(item)}
                      className="text-gray-400 hover:text-yellow-400 transition-colors capitalize flex items-center group"
                    >
                      <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Connect With Us</h4>
              <div className="flex flex-col space-y-4">
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center group">
                  <Twitter className="h-5 w-5 mr-3" />
                  <span>Twitter</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center group">
                  <Facebook className="h-5 w-5 mr-3" />
                  <span>Facebook</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center group">
                  <Instagram className="h-5 w-5 mr-3" />
                  <span>Instagram</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors flex items-center group">
                  <Linkedin className="h-5 w-5 mr-3" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Stay Updated</h4>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest safety updates.</p>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                  />
                </div>
                <button className="w-full bg-yellow-400 text-gray-900 py-3 rounded-xl hover:bg-yellow-500 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center group">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-16 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm">&copy; 2024 RoadGuard. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;