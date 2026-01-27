import React, { useEffect, useRef, useState } from "react";
import SunitaPhoto from "../../assets/Media.jpeg";

const developers = [
  {
    name: "Stephen Raj",
    role: "Software Development Engineer II - MEAN Full Stack",
    quote: "Passionate about creating seamless user experiences through clean, efficient code. When I'm not debugging, you'll find me contributing to open-source projects or mentoring new developers.",
    photo:
      "https://static.wixstatic.com/media/55b606_b4c8af695ffc42dd86995ba5732adc20~mv2.png/v1/crop/x_4,y_0,w_808,h_816/fill/w_624,h_630,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Stephen%20Raj.png",
  },
  {
    name: "Pankaj Ahakey",
    role: "Software Development Engineer I - Back end",
    quote: "I love turning complex problems into simple, beautiful solutions. My tech stack includes React, TypeScript, and GraphQL, and I'm always exploring new frameworks.",
    photo:
      "https://static.wixstatic.com/media/55b606_0fe85b706400430ca4d10c181c4f2105~mv2.png/v1/crop/x_4,y_0,w_808,h_816/fill/w_624,h_630,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Pankaj.png",
  },
  {
    name: "Sunita Murale",
    role: "Software Development Engineer II - Mobile Application",
    quote: "Dedicated to crafting intuitive mobile experiences that users love. I believe great apps are built with empathy, attention to detail, and a passion for continuous learning.",
    photo: SunitaPhoto,
  },
  {
    name: "Ranjith Jayapal",
    role: "Software Development Engineer III - Mobile Application",
    quote: "Building the future one line of code at a time. Specializing in scalable backend systems and cloud architecture. Coffee-powered developer ☕",
    photo:
      "https://static.wixstatic.com/media/55b606_ab10cc12fdba44de831424850f2ea320~mv2.jpg/v1/crop/x_3,y_0,w_594,h_600/fill/w_624,h_630,al_c,lg_1,q_85,enc_avif,quality_auto/Ranjith%20Jayapal_Profile%20Pic.jpg",
  },
 
  {
    name: "Omjith Surendran",
    role: "Software Development Engineer I - Front end",
    quote: "We built a unified HR hub that bridges the gap between management and staff with real-time data tracking and interactive employee profiles.",
    photo:
      "https://static.wixstatic.com/media/55b606_0d85f9a893da4be1bf972a42517833f5~mv2.jpg/v1/crop/x_4,y_0,w_808,h_816/fill/w_624,h_630,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Omjith_edited.jpg",
  },
];

export default function AboutTeam() {
  const [isVisible, setIsVisible] = useState({});
  const [imageLoaded, setImageLoaded] = useState({});
  const heroRef = useRef(null);
  const projectRef = useRef(null);
  const teamRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all sections
    [heroRef, projectRef, teamRef, ctaRef].forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    // Set initial visibility for hero
    if (heroRef.current) {
      setIsVisible(prev => ({ ...prev, hero: true }));
    }

    return () => {
      [heroRef, projectRef, teamRef, ctaRef].forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  const handleImageLoad = (id) => {
    setImageLoaded(prev => ({ ...prev, [id]: true }));
  };

  return (
    <>
      <div 
        className="min-h-screen relative overflow-hidden" 
        style={{ 
          backgroundColor: '#F8FAFC',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Geometric shapes with gradient */}
          <div 
            className="absolute top-20 right-10 w-72 h-72 opacity-10"
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              animation: 'float 20s ease-in-out infinite',
              filter: 'blur(60px)'
            }}
          />
          <div 
            className="absolute bottom-40 left-10 w-96 h-96 opacity-10"
            style={{
              background: 'linear-gradient(135deg, #14B8A6 0%, #2563EB 100%)',
              borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
              animation: 'float 25s ease-in-out infinite reverse',
              filter: 'blur(60px)'
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-8"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 100%)',
              borderRadius: '50%',
              animation: 'float 30s ease-in-out infinite',
              filter: 'blur(80px)'
            }}
          />
          
          {/* Code pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563EB' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Hero Section */}
        <section 
          ref={heroRef}
          id="hero"
          className="relative py-20 sm:py-24 lg:py-32 z-10 overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F8FAFC 100%)'
          }}
        >
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)'
            }}
          ></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div 
              className={`max-w-5xl transition-all duration-1000 ${
                isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <p 
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: '#000000', fontFamily: "'Poppins', sans-serif" }}
              >
                Welcome to Irish Taylor & Co
              </p>
              <h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
                style={{ 
                  color: '#1E293B',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 800,
                  lineHeight: '1.1'
                }}
              >
                Meet the Minds Behind X-Bridge
              </h1>
              <p 
                className="text-xl sm:text-2xl font-medium mb-8"
                style={{ 
                  color: '#000000',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600
                }}
              >
                Your Growth Partner
              </p>
              <p 
                className="text-lg sm:text-xl leading-relaxed max-w-3xl"
                style={{ color: '#1E293B', lineHeight: '1.75' }}
              >
                A small team of curious builders, product thinkers, and problem
                solvers dedicated to crafting modern, people-first experiences that feel simple,
                intuitive, and genuinely helpful for teams of every size.
              </p>
            </div>
          </div>
        </section>

        {/* Project Summary Section */}
        <section 
          ref={projectRef}
          id="project"
          className="relative border-t py-12 sm:py-16 z-10"
          style={{ 
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            borderColor: '#E2E8F0' 
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className={`max-w-5xl transition-all duration-1000 delay-200 ${
                isVisible.project ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <p 
                className="text-sm font-semibold uppercase tracking-wider mb-2"
                style={{ color: '#000000', fontFamily: "'Poppins', sans-serif" }}
              >
                Our Project
              </p>
              <h2 
                className="text-3xl sm:text-4xl font-bold mb-6"
                style={{ 
                  color: '#1E293B',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700
                }}
              >
                X-Bridge
              </h2>
              <div 
                className="p-8 border rounded-lg transition-all duration-300 hover:shadow-lg"
                style={{ 
                  backgroundColor: '#FFFFFF', 
                  borderColor: '#E2E8F0',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
              >
                <p 
                  className="leading-relaxed text-base"
                  style={{ color: '#1E293B', lineHeight: '1.75' }}
                >
                  X-Bridge is a role-based HR management application designed to streamline daily employee operations and managerial oversight. It provides dedicated dashboards for Employees, Managers, HR, and Admin users with secure authentication and controlled access. The platform's core feature is the EOD (End of Day) reporting system, enabling daily work tracking and real-time visibility for managers. Key HR modules include Attendance management, Leave management, and an Employee Directory with searchable profiles. The application is built with a responsive UI, consistent design, and demo-ready data to ensure smooth presentation. The focus is on delivering fully functional core features with high reliability and usability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Grid Section */}
        <section 
          ref={teamRef}
          id="team"
          className="relative border-t py-12 sm:py-16 z-10"
          style={{ 
            background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
            borderColor: '#E2E8F0' 
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              className={`mb-12 max-w-5xl transition-all duration-1000 delay-300 ${
                isVisible.team ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <p 
                className="text-sm font-semibold uppercase tracking-wider mb-2"
                style={{ color: '#000000', fontFamily: "'Poppins', sans-serif" }}
              >
                Our Team
              </p>
              <h2 
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ 
                  color: '#1E293B',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700
                }}
              >
                Team QuadX
              </h2>
              <p 
                className="text-base"
                style={{ color: '#1E293B', lineHeight: '1.75' }}
              >
                We combine engineering excellence with a deep understanding of how real teams work.
                Every feature starts with a conversation about people, not just pixels.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 justify-items-center mb-16">
              {developers.map((dev, index) => (
                <article
                  key={dev.name}
                  id={`dev-${index}`}
                  className={`rounded-2xl border overflow-hidden w-full max-w-[320px] transition-all duration-300 shadow-md group ${
                    isVisible.team ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#E2E8F0',
                    transitionDelay: `${400 + index * 100}ms`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#000000';
                    e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    {!imageLoaded[dev.name] && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: '#E2E8F0' }}
                      >
                        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2563EB' }}></div>
                      </div>
                    )}
                    <img
                      src={dev.photo}
                      alt={`Professional headshot of ${dev.name}, ${dev.role}`}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                        imageLoaded[dev.name] ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading="lazy"
                      onLoad={() => handleImageLoad(dev.name)}
                    />
                    {/* Decorative overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 
                      className="font-bold mb-2"
                      style={{ 
                        color: '#1E293B',
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: '1.125rem'
                      }}
                    >
                      {dev.name}
                    </h3>
                    <p 
                      className="text-sm font-semibold leading-tight mb-4"
                      style={{ 
                        color: '#000000',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600
                      }}
                    >
                      {dev.role}
                    </p>
                    {dev.quote && (
                      <p 
                        className="text-xs leading-relaxed mb-4"
                        style={{ 
                          color: '#1E293B',
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 400,
                          lineHeight: '1.6',
                          fontStyle: 'italic'
                        }}
                      >
                        "{dev.quote}"
                      </p>
                    )}
                  
                  </div>
                </article>
              ))}
            </div>

            {/* Call to action */}
            <div 
              ref={ctaRef}
              id="cta"
              className={`rounded-xl border p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-5xl transition-all duration-1000 delay-500 ${
                isVisible.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ 
                background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
                borderColor: '#E2E8F0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              <div className="flex-1">
                <p 
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#000000', fontFamily: "'Poppins', sans-serif" }}
                >
                  Work with us
                </p>
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ 
                    color: '#1E293B',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700
                  }}
                >
                  Want to build the future of HR with us?
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: '#1E293B', lineHeight: '1.75' }}
                >
                  We're always excited to collaborate with teams who care deeply about people
                  experience, culture, and craft. Reach out to explore partnerships, integrations, or
                  careers.
                </p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href="https://www.irishtaylor.com/contact-us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:opacity-90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: '#14B8A6',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600
                  }}
                  onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(20, 184, 166, 0.5)'}
                  onBlur={(e) => e.currentTarget.style.boxShadow = ''}
                  aria-label="Contact us to explore partnerships and careers"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </>
  );
}
