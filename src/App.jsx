import React, { useState, useEffect } from 'react';

export default function BirthdayRSVP() {
  const [bookOpen, setBookOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    attendance: '',
    guestCount: '',
    notes: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [submittedEmails, setSubmittedEmails] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const confettiCount = 30;
    const confettiElements = [];
    for (let i = 0; i < confettiCount; i++) {
      confettiElements.push({
        id: i,
        left: Math.random() * 100,
        duration: Math.random() * 3 + 4,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.5 + 0.5,
        rotate: Math.random() * 360,
        color: i % 3 === 0 ? '#2c3e50' : i % 2 === 0 ? '#f4e4a6' : '#d4af37'
      });
    }
    setConfetti(confettiElements);

    // Load submitted emails from storage
    const loadSubmittedEmails = async () => {
      try {
        const result = await window.storage.get('submitted-emails', true);
        if (result && result.value) {
          setSubmittedEmails(JSON.parse(result.value));
        }
      } catch (error) {
        console.log('No previous submissions found');
      }
    };
    loadSubmittedEmails();
  }, []);

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup({ show: false, message: '', type: '' });
    }, 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttendanceChange = (value) => {
    setFormData(prev => ({
      ...prev,
      attendance: value,
      guestCount: value !== 'yes' ? '' : prev.guestCount
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.attendance) {
      showPopup('Please fill in all required fields', 'error');
      return;
    }
    
    if (formData.attendance === 'yes' && !formData.guestCount) {
      showPopup('Please specify the number of guests', 'error');
      return;
    }

    // Check if email has already been used
    const emailLower = formData.email.toLowerCase().trim();
    if (submittedEmails.includes(emailLower)) {
      showPopup('This email has already been used. Please use a different email or contact Esther directly.', 'error');
      return;
    }
    
    const emailBody = `
New RSVP for Esther's Birthday Celebration
==========================================

Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Attendance: ${formData.attendance}
${formData.attendance === 'yes' ? `Number of Guests: ${formData.guestCount}` : ''}
Notes: ${formData.notes || 'None'}

Event Details: December 14th, 2025 at 4:00 PM
    `.trim();

    try {
      showPopup('Submitting your RSVP...', 'info');
      
      const response = await fetch('https://formspree.io/f/xdkyoqbg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          attendance: formData.attendance,
          guestCount: formData.guestCount,
          notes: formData.notes,
          message: emailBody
        })
      });

      if (response.ok) {
        // Add email to submitted list and save to storage
        const updatedEmails = [...submittedEmails, emailLower];
        setSubmittedEmails(updatedEmails);
        
        try {
          await window.storage.set('submitted-emails', JSON.stringify(updatedEmails), true);
        } catch (storageError) {
          console.error('Could not save to storage:', storageError);
        }
        
        showPopup('🎉 RSVP submitted successfully!', 'success');
        setTimeout(() => {
          setIsSubmitted(true);
        }, 1500);
      } else {
        showPopup('There was a problem submitting your RSVP. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showPopup('Connection error. Please check your internet and try again.', 'error');
    }
  };

  const images = [
    { src: 'images/LOVE.jpg', alt: 'Esther' },
    { src: 'images/TT.jpg', alt: 'Esther' },
    { src: 'images/RR.jpg', alt: 'Esther' },
    { src: 'images/UU.jpg', alt: 'Esther' },
    { src: 'images/YY.jpg', alt: 'Esther' },
    { src: 'images/OO.jpg', alt: 'Esther' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 flex items-center justify-center relative overflow-hidden font-serif">
      {/* Sweet Popup Notification */}
      {popup.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-11/12 max-w-md animate-slideDown">
          <div className={`rounded-lg shadow-2xl p-4 flex items-center gap-3 backdrop-blur-sm ${
            popup.type === 'success' ? 'bg-green-50 border-2 border-green-500 text-green-800' :
            popup.type === 'error' ? 'bg-red-50 border-2 border-red-500 text-red-800' :
            'bg-blue-50 border-2 border-blue-500 text-blue-800'
          }`}>
            <div className="text-2xl flex-shrink-0">
              {popup.type === 'success' ? '✓' : popup.type === 'error' ? '⚠' : 'ℹ'}
            </div>
            <div className="flex-1 font-sans text-sm sm:text-base font-medium">
              {popup.message}
            </div>
            <button
              onClick={() => setPopup({ show: false, message: '', type: '' })}
              className="text-xl leading-none opacity-60 hover:opacity-100 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Confetti Animation */}
      {bookOpen && confetti.map(item => (
        <div
          key={item.id}
          className="fixed w-2.5 h-2.5 pointer-events-none z-50"
          style={{
            left: `${item.left}%`,
            top: '-10%',
            backgroundColor: item.color,
            opacity: item.opacity,
            transform: `rotate(${item.rotate}deg)`,
            animation: `fall ${item.duration}s linear infinite ${item.delay}s`
          }}
        />
      ))}

      <style>{`
        @keyframes fall {
          0% { top: -10%; opacity: 1; }
          100% { top: 110%; opacity: 0.3; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes scaleUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideDown {
          from { 
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to { 
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
        
        .page-content {
          animation: fadeIn 0.8s ease-in 0.5s forwards;
        }
        
        .book-reveal {
          animation: scaleUp 1s ease-out forwards;
        }
      `}</style>

      {/* Audio Control */}
      {bookOpen && (
        <button
          className={`fixed top-3 right-3 sm:top-5 sm:right-5 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-800 flex items-center justify-center text-lg sm:text-xl cursor-pointer shadow-lg transition-all hover:scale-110 z-50 ${
            isPlaying ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}
          onClick={() => {
            setIsPlaying(!isPlaying);
            showPopup(isPlaying ? 'Music paused' : 'Music playing', 'info');
          }}
          title="Play/Pause Music"
          aria-label="Toggle music"
        >
          {isPlaying ? '🎵' : '🔇'}
        </button>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 sm:top-8 sm:right-8 text-white text-3xl sm:text-4xl w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all hover:rotate-90"
            onClick={() => setLightboxImage(null)}
            aria-label="Close lightbox"
          >
            ×
          </button>
          <img
            src={lightboxImage}
            alt="Enlarged"
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Book Container */}
      <div className="relative w-full max-w-6xl mx-auto">
        {!bookOpen ? (
          /* Closed Book Cover */
          <div 
            className="relative w-full max-w-md mx-auto cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => {
              setBookOpen(true);
              showPopup('Welcome to Esther\'s Birthday Celebration! ✨', 'success');
            }}
            style={{ animation: 'pulse 2s ease-in-out infinite' }}
          >
            <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-lg shadow-2xl p-8 border-4 border-yellow-600">
              {/* Book Spine Effect */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-yellow-700 to-yellow-600 rounded-l-lg" />
              
              {/* Cover Content */}
              <div className="text-center relative z-10">
                {/* Main Photo */}
                <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-yellow-600 shadow-xl">
                  <img
                    src="images/LOVE.jpg"
                    alt="Esther"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-6xl">👑</div>';
                    }}
                  />
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-3 tracking-wide">
                  Esther's
                </h1>
                <div className="text-5xl sm:text-6xl font-bold text-white mb-4">
                  Birthday
                </div>
                <div className="text-2xl sm:text-3xl text-yellow-400 mb-6">
                  Celebration
                </div>
                
                <div className="text-white text-lg mb-6">
                  December 14th, 2025
                </div>
                
                <div className="inline-block bg-yellow-600 text-gray-900 px-6 py-3 rounded-full font-semibold animate-pulse">
                  Tap to Open ✨
                </div>
              </div>
              
              {/* Decorative corners */}
              <div className="absolute top-4 left-12 text-yellow-600 text-3xl">❋</div>
              <div className="absolute top-4 right-4 text-yellow-600 text-3xl">❋</div>
              <div className="absolute bottom-4 left-12 text-yellow-600 text-3xl">❋</div>
              <div className="absolute bottom-4 right-4 text-yellow-600 text-3xl">❋</div>
            </div>
          </div>
        ) : (
          /* Opened Book */
          <div className="relative w-full book-reveal">
            <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-lg shadow-2xl overflow-hidden">
              {/* Left Page */}
              <div className={`bg-gradient-to-br from-gray-800 to-gray-700 p-6 sm:p-8 md:p-10 lg:p-12 text-white flex flex-col justify-center relative ${bookOpen ? 'page-content' : 'opacity-0'}`}>
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-yellow-600 via-yellow-200 to-yellow-600 hidden lg:block" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 via-yellow-200 to-yellow-600 lg:hidden" />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 sm:mb-8">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-full pb-[100%] overflow-hidden rounded-md shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:z-10"
                      onClick={() => setLightboxImage(img.src)}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.target.parentElement.innerHTML = '<div class="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-2xl sm:text-4xl">📷</div>';
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl mb-3 font-normal tracking-wide">
                    Esther's Birthday Celebration
                  </h1>
                  <div className="w-12 sm:w-16 h-0.5 bg-yellow-600 mx-auto my-4 sm:my-5" />
                  <div className="text-sm sm:text-base leading-relaxed font-sans">
                    <strong className="text-yellow-600 font-semibold">Sunday, December 14th, 2025</strong>
                    <br />
                    4:00 PM onwards
                    <br />
                    [Venue to be confirmed]
                  </div>
                </div>
              </div>

              {/* Right Page - Form or Thank You */}
              <div className={`p-6 sm:p-8 md:p-10 lg:p-12 overflow-y-auto max-h-screen lg:max-h-[90vh] ${bookOpen ? 'page-content' : 'opacity-0'}`}>
                {isSubmitted ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center py-8">
                      <div className="text-5xl sm:text-6xl mb-6">✨</div>
                      <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Thank You!</h2>
                      <p className="text-base sm:text-lg text-gray-700 mb-6 font-sans">
                        Your RSVP has been received.
                      </p>
                      <div className="max-w-md mx-auto text-sm sm:text-base text-gray-600 leading-relaxed mb-8 font-sans italic">
                        "A woman of grace, kindness, and radiant joy. Her laughter lights up every room, 
                        and her heart touches every soul. Here's to another year of being absolutely wonderful!"
                      </div>
                      <div className="text-sm text-gray-500 font-sans">
                        With love and gratitude
                      </div>
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setBookOpen(false);
                          setFormData({
                            fullName: '',
                            email: '',
                            phone: '',
                            attendance: '',
                            guestCount: '',
                            notes: ''
                          });
                        }}
                        className="mt-8 px-6 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition-all font-sans"
                      >
                        Close Book
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-xs sm:text-sm uppercase tracking-widest text-gray-800 mb-5 sm:mb-6 font-semibold font-sans">
                      Kindly Respond
                    </div>

                    <div className="space-y-5 sm:space-y-7">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                          <label className="block mb-2 sm:mb-2.5 font-medium text-gray-800 text-sm font-sans">
                            Full Name <span className="text-yellow-600">*</span>
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="w-full p-3 sm:p-3.5 border border-gray-300 bg-gray-50 text-sm sm:text-base font-sans transition-all focus:outline-none focus:border-gray-800 focus:bg-white focus:shadow-sm rounded-sm"
                          />
                        </div>

                        <div>
                          <label className="block mb-2 sm:mb-2.5 font-medium text-gray-800 text-sm font-sans">
                            Email Address <span className="text-yellow-600">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            className="w-full p-3 sm:p-3.5 border border-gray-300 bg-gray-50 text-sm sm:text-base font-sans transition-all focus:outline-none focus:border-gray-800 focus:bg-white focus:shadow-sm rounded-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 sm:mb-2.5 font-medium text-gray-800 text-sm font-sans">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+256 XXX XXX XXX"
                          className="w-full p-3 sm:p-3.5 border border-gray-300 bg-gray-50 text-sm sm:text-base font-sans transition-all focus:outline-none focus:border-gray-800 focus:bg-white focus:shadow-sm rounded-sm"
                        />
                        <div className="text-xs text-gray-500 mt-1.5 italic font-sans">
                          Optional - for event updates
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 sm:mb-2.5 font-medium text-gray-800 text-sm font-sans">
                          Will you attend? <span className="text-yellow-600">*</span>
                        </label>
                        <div className="flex flex-col gap-2.5 sm:gap-3.5">
                          {['yes', 'maybe', 'no'].map((value) => (
                            <label
                              key={value}
                              className={`flex items-center p-3 sm:p-4 border cursor-pointer transition-all bg-gray-50 hover:border-gray-800 hover:bg-white rounded-sm ${
                                formData.attendance === value
                                  ? 'border-gray-800 bg-white shadow-sm'
                                  : 'border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="attendance"
                                value={value}
                                checked={formData.attendance === value}
                                onChange={() => handleAttendanceChange(value)}
                                className="mr-3 w-4 h-4 cursor-pointer accent-gray-800 flex-shrink-0"
                              />
                              <span className="font-sans text-gray-800 text-sm sm:text-base">
                                {value === 'yes' && 'Yes, I will attend'}
                                {value === 'maybe' && 'Possibly, to be confirmed'}
                                {value === 'no' && 'Unable to attend'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {formData.attendance === 'yes' && (
                        <div>
                          <label className="block mb-2 sm:mb-2.5 font-medium text-gray-800 text-sm font-sans">
                            Number of guests (including yourself) <span className="text-yellow-600">*</span>
                          </label>
                          <input
                            type="number"
                            name="guestCount"
                            min="1"
                            max="20"
                            value={formData.guestCount}
                            onChange={handleInputChange}
                            placeholder="Enter number"
                            className="w-full p-3 sm:p-3.5 border border-gray-300 bg-gray-50 text-sm sm:text-base font-sans transition-all focus:outline-none focus:border-gray-800 focus:bg-white focus:shadow-sm rounded-sm"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block mb-2 sm:mb-2.5 font-medium text-gray-800 text-sm font-sans">
                          Dietary restrictions or special requests
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Please let us know of any dietary requirements, allergies, or other considerations..."
                          rows="4"
                          className="w-full p-3 sm:p-3.5 border border-gray-300 bg-gray-50 text-sm sm:text-base font-sans transition-all resize-y focus:outline-none focus:border-gray-800 focus:bg-white focus:shadow-sm rounded-sm"
                        />
                      </div>

                      <button
                        onClick={handleSubmit}
                        className="w-full p-3.5 sm:p-4 bg-gray-800 text-white text-sm sm:text-base font-semibold cursor-pointer transition-all uppercase tracking-wide font-sans hover:bg-gray-700 hover:shadow-lg active:translate-y-px rounded-sm"
                      >
                        Submit Response
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}