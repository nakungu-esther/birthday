import React, { useEffect, useRef, useState } from "react";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  attendance: "",
  guestCount: "",
  notes: "",
};

const IMAGES = [
  { src: "/images/LOVE.jpg", alt: "Esther" },
  { src: "/images/TT.jpg", alt: "Esther" },
  { src: "/images/RR.jpg", alt: "Esther" },
  { src: "/images/UU.jpg", alt: "Esther" },
  { src: "/images/YY.jpg", alt: "Esther" },
  { src: "/images/OO.jpg", alt: "Esther" },
];

export default function App() {
  const [bookOpen, setBookOpen] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [submittedEmails, setSubmittedEmails] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const audioRef = useRef(null);
  const popupTimerRef = useRef(null);

  useEffect(() => {
    const audio = new Audio("/music/birthday-song.mp3");

    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
      audio.currentTime = 0;

      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const elements = Array.from({ length: 30 }, (_, index) => ({
      id: index,
      left: Math.random() * 100,
      duration: Math.random() * 3 + 4,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.5,
      rotate: Math.random() * 360,
      color:
        index % 3 === 0
          ? "#9ca3af"
          : index % 2 === 0
            ? "#ffffff"
            : "#d4af37",
    }));

    setConfetti(elements);

    try {
      const stored = localStorage.getItem("esther-birthday-submitted-emails");

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setSubmittedEmails(
            parsed.filter((email) => typeof email === "string"),
          );
        }
      }
    } catch (error) {
      console.error("Could not load previous submissions:", error);
    }

    return () => {
      window.clearTimeout(popupTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!lightboxImage) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setLightboxImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxImage]);

  const showPopup = (message, type = "success") => {
    window.clearTimeout(popupTimerRef.current);

    setPopup({
      show: true,
      message,
      type,
    });

    popupTimerRef.current = window.setTimeout(() => {
      setPopup({
        show: false,
        message: "",
        type: "info",
      });
    }, 4000);
  };

  const dismissPopup = () => {
    window.clearTimeout(popupTimerRef.current);

    setPopup({
      show: false,
      message: "",
      type: "info",
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAttendanceChange = (value) => {
    setFormData((previous) => ({
      ...previous,
      attendance: value,
      guestCount: value === "yes" ? previous.guestCount : "",
    }));
  };

  const handleImageError = (src) => {
    setImageErrors((previous) => ({
      ...previous,
      [src]: true,
    }));
  };

  const openBook = async () => {
    setBookOpen(true);

    const audio = audioRef.current;

    if (!audio) {
      showPopup("Welcome to Esther's Birthday Celebration! ✨", "success");
      return;
    }

    try {
      await audio.play();

      showPopup(
        "Welcome to Esther's Birthday Celebration! ✨",
        "success",
      );
    } catch (error) {
      console.error("Could not start music:", error);

      showPopup(
        "Welcome! Tap the music button to play sound 🎵",
        "info",
      );
    }
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      showPopup("Music paused", "info");
      return;
    }

    try {
      await audio.play();
      showPopup("Music playing ♪", "info");
    } catch (error) {
      console.error("Could not play music:", error);

      showPopup(
        "Could not play music. Please check that the music file is available.",
        "error",
      );
    }
  };

  const closeBook = () => {
    audioRef.current?.pause();

    setBookOpen(false);
    setIsSubmitted(false);
    setFormData({ ...INITIAL_FORM });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const fullName = formData.fullName.trim();
    const email = formData.email.toLowerCase().trim();

    if (!fullName || !email || !formData.attendance) {
      showPopup("Please fill in all required fields.", "error");
      return;
    }

    const guestCount = Number(formData.guestCount);

    if (
      formData.attendance === "yes" &&
      (!Number.isInteger(guestCount) ||
        guestCount < 1 ||
        guestCount > 20)
    ) {
      showPopup(
        "Please enter between 1 and 20 guests, including yourself.",
        "error",
      );
      return;
    }

    if (submittedEmails.includes(email)) {
      showPopup(
        "An RSVP has already been submitted with this email on this browser. Please contact Esther if you need to change it.",
        "error",
      );
      return;
    }

    const emailBody = `
New RSVP for Esther's Birthday Celebration
==========================================

Name: ${fullName}
Email: ${email}
Phone: ${formData.phone.trim() || "Not provided"}
Attendance: ${formData.attendance}
${
  formData.attendance === "yes"
    ? `Number of Guests: ${guestCount}`
    : ""
}
Notes: ${formData.notes.trim() || "None"}

Event Date: December 14th, 2026
Time: 5:00 PM onwards
Venue: To be communicated
Dress Code: Grey and White
    `.trim();

    setIsSubmitting(true);
    showPopup("Submitting your RSVP...", "info");

    try {
      const response = await fetch("https://formspree.io/f/xdkyoqbg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          phone: formData.phone.trim(),
          attendance: formData.attendance,
          guestCount: formData.attendance === "yes" ? guestCount : "",
          notes: formData.notes.trim(),
          venue: "To be communicated",
          dressCode: "Grey and White",
          message: emailBody,
        }),
      });

      if (!response.ok) {
        showPopup(
          "There was a problem submitting your RSVP. Please try again.",
          "error",
        );
        return;
      }

      const updatedEmails = [...submittedEmails, email];

      setSubmittedEmails(updatedEmails);

      try {
        localStorage.setItem(
          "esther-birthday-submitted-emails",
          JSON.stringify(updatedEmails),
        );
      } catch (error) {
        console.error("Could not save submission locally:", error);
      }

      setIsSubmitted(true);
      showPopup("🎉 RSVP submitted successfully!", "success");
    } catch (error) {
      console.error("RSVP submission failed:", error);

      showPopup(
        "Connection error. Please check your internet and try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-sm font-sans text-gray-800 transition-all focus:border-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 sm:p-3.5 sm:text-base";

  const labelClass =
    "mb-2 block font-sans text-sm font-medium text-gray-800";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 font-serif sm:p-6">
      <style>{`
        @keyframes birthday-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0.2;
          }
        }

        @keyframes birthday-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes birthday-cover-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.025);
          }
        }

        @keyframes birthday-book-reveal {
          from {
            opacity: 0;
            transform: scale(0.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes birthday-popup {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .birthday-cover {
          animation: birthday-cover-pulse 2.5s ease-in-out infinite;
        }

        .birthday-book {
          animation: birthday-book-reveal 0.7s ease-out both;
        }

        .birthday-page {
          animation: birthday-fade-in 0.7s ease-out both;
        }

        .birthday-popup {
          animation: birthday-popup 0.3s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .birthday-cover,
          .birthday-book,
          .birthday-page,
          .birthday-popup,
          .birthday-confetti {
            animation: none !important;
          }
        }
      `}</style>

      {/* Popup notification */}
      {popup.show && (
        <div className="fixed left-1/2 top-4 z-[100] w-11/12 max-w-md -translate-x-1/2">
          <div
            role={popup.type === "error" ? "alert" : "status"}
            className={`birthday-popup flex items-center gap-3 rounded-lg border-2 p-4 shadow-2xl ${
              popup.type === "success"
                ? "border-green-500 bg-green-50 text-green-800"
                : popup.type === "error"
                  ? "border-red-500 bg-red-50 text-red-800"
                  : "border-blue-500 bg-blue-50 text-blue-800"
            }`}
          >
            <span className="shrink-0 text-2xl" aria-hidden="true">
              {popup.type === "success"
                ? "✓"
                : popup.type === "error"
                  ? "⚠"
                  : "ℹ"}
            </span>

            <p className="flex-1 font-sans text-sm font-medium sm:text-base">
              {popup.message}
            </p>

            <button
              type="button"
              onClick={dismissPopup}
              aria-label="Dismiss notification"
              className="shrink-0 text-2xl leading-none opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Confetti */}
      {bookOpen &&
        confetti.map((item) => (
          <div
            key={item.id}
            aria-hidden="true"
            className="birthday-confetti pointer-events-none fixed top-0 z-40 h-2.5 w-2.5"
            style={{
              left: `${item.left}%`,
              backgroundColor: item.color,
              opacity: item.opacity,
              rotate: `${item.rotate}deg`,
              animation: `birthday-fall ${item.duration}s linear ${item.delay}s infinite`,
              animationFillMode: "backwards",
            }}
          />
        ))}

      {/* Music control */}
      {bookOpen && (
        <button
          type="button"
          onClick={toggleMusic}
          title={isPlaying ? "Pause music" : "Play music"}
          aria-label={isPlaying ? "Pause music" : "Play music"}
          aria-pressed={isPlaying}
          className={`fixed right-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-800 text-xl shadow-lg transition-transform hover:scale-110 sm:right-5 sm:top-5 sm:h-12 sm:w-12 ${
            isPlaying
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          {isPlaying ? "🎵" : "🔇"}
        </button>
      )}

      {/* Image lightbox */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label="Close photo preview"
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-4xl text-white transition-colors hover:bg-white/30"
          >
            ×
          </button>

          {imageErrors[lightboxImage] ? (
            <div className="rounded-lg bg-gray-700 p-16 text-6xl text-white">
              📷
            </div>
          ) : (
            <img
              src={lightboxImage}
              alt="Esther, enlarged"
              onClick={(event) => event.stopPropagation()}
              onError={() => handleImageError(lightboxImage)}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
          )}
        </div>
      )}

      <main className="relative mx-auto w-full max-w-6xl">
        {!bookOpen ? (
          /* Closed invitation */
          <button
            type="button"
            onClick={openBook}
            aria-label="Open Esther's birthday invitation"
            className="birthday-cover relative mx-auto block w-full max-w-md cursor-pointer rounded-xl text-center shadow-2xl focus:outline-none focus:ring-4 focus:ring-yellow-500"
          >
            <div className="relative overflow-hidden rounded-xl border-4 border-yellow-600 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-8">
              <div className="absolute bottom-0 left-0 top-0 w-6 bg-gradient-to-r from-yellow-700 to-yellow-600" />

              <div className="relative z-10 pl-3">
                <div className="relative mx-auto mb-6 h-44 w-44 overflow-hidden rounded-full border-4 border-yellow-600 shadow-xl sm:h-48 sm:w-48">
                  {imageErrors["/images/LOVE.jpg"] ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-600 text-6xl">
                      👑
                    </div>
                  ) : (
                    <img
                      src="/images/LOVE.jpg"
                      alt="Esther"
                      onError={() => handleImageError("/images/LOVE.jpg")}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <h1 className="mb-3 text-3xl font-bold tracking-wide text-yellow-400 sm:text-4xl">
                  Esther&apos;s
                </h1>

                <div className="mb-4 text-5xl font-bold text-white sm:text-6xl">
                  Birthday
                </div>

                <div className="mb-6 text-2xl text-yellow-400 sm:text-3xl">
                  Celebration
                </div>

                <p className="mb-6 text-lg text-white">
                  December 14th, 2026
                </p>

                <span className="inline-block rounded-full bg-yellow-600 px-6 py-3 font-sans font-semibold text-gray-900">
                  Tap to Open ✨
                </span>
              </div>

              <span
                aria-hidden="true"
                className="absolute left-10 top-3 text-3xl text-yellow-600"
              >
                ❋
              </span>
              <span
                aria-hidden="true"
                className="absolute right-3 top-3 text-3xl text-yellow-600"
              >
                ❋
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-3 left-10 text-3xl text-yellow-600"
              >
                ❋
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-3 right-3 text-3xl text-yellow-600"
              >
                ❋
              </span>
            </div>
          </button>
        ) : (
          /* Open invitation */
          <div className="birthday-book overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left page */}
              <section className="birthday-page relative flex flex-col justify-center bg-gradient-to-br from-gray-800 to-gray-700 p-6 text-white sm:p-8 md:p-10 lg:p-12">
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-600 via-yellow-200 to-yellow-600 lg:hidden" />

                <div className="absolute bottom-0 right-0 top-0 hidden w-1 bg-gradient-to-b from-yellow-600 via-yellow-200 to-yellow-600 lg:block" />

                <div className="mb-6 grid grid-cols-2 gap-2 sm:mb-8 sm:grid-cols-3">
                  {IMAGES.map((image, index) => (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() => setLightboxImage(image.src)}
                      aria-label={`Enlarge Esther photo ${index + 1}`}
                      className="relative aspect-square overflow-hidden rounded-md shadow-lg transition-transform hover:z-10 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      {imageErrors[image.src] ? (
                        <div className="flex h-full w-full items-center justify-center bg-gray-600 text-4xl">
                          📷
                        </div>
                      ) : (
                        <img
                          src={image.src}
                          alt={image.alt}
                          onError={() => handleImageError(image.src)}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <h1 className="mb-3 text-2xl font-normal tracking-wide sm:text-3xl md:text-4xl">
                    Esther&apos;s Birthday Celebration
                  </h1>

                  <div className="mx-auto my-5 h-0.5 w-16 bg-yellow-600" />

                  <div className="space-y-3 font-sans text-sm leading-relaxed sm:text-base">
                    <p className="font-semibold text-yellow-400">
                      December 14th, 2026
                    </p>

                    <p>5:00 PM onwards</p>

                    <p>
                      <strong>Venue:</strong> To be communicated
                    </p>

                    <div className="pt-2">
                      <div className="inline-flex flex-col items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-6 py-4 text-gray-800 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-widest text-gray-600">
                          Dress Code
                        </span>

                        <span className="text-lg font-semibold sm:text-xl">
                          Grey and White
                        </span>

                        <div
                          aria-hidden="true"
                          className="flex items-center gap-3"
                        >
                          <span className="h-5 w-5 rounded-full border border-gray-500 bg-gray-500" />
                          <span className="h-5 w-5 rounded-full border border-gray-300 bg-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Right page */}
              <section className="birthday-page p-6 sm:p-8 md:p-10 lg:max-h-[90vh] lg:overflow-y-auto lg:p-12">
                {isSubmitted ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="py-8 text-center">
                      <div className="mb-6 text-6xl">✨</div>

                      <h2 className="mb-4 text-3xl font-bold text-gray-800 sm:text-4xl">
                        Thank You!
                      </h2>

                      <p className="mb-6 font-sans text-base text-gray-700 sm:text-lg">
                        Your RSVP has been received.
                      </p>

                      <blockquote className="mx-auto mb-8 max-w-md font-sans text-sm italic leading-relaxed text-gray-600 sm:text-base">
                        A woman of grace, kindness, and radiant joy. Her
                        laughter lights up every room, and her heart
                        touches every soul. Here&apos;s to another year of
                        being absolutely wonderful!
                      </blockquote>

                      <p className="font-sans text-sm text-gray-500">
                        With love and gratitude
                      </p>

                      <button
                        type="button"
                        onClick={closeBook}
                        className="mt-8 rounded-full bg-gray-800 px-6 py-3 font-sans font-semibold text-white transition-colors hover:bg-gray-700"
                      >
                        Close Book
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="mb-6 font-sans text-sm font-semibold uppercase tracking-widest text-gray-800">
                      Kindly Respond
                    </h2>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-5 sm:space-y-7"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="fullName" className={labelClass}>
                            Full Name{" "}
                            <span className="text-yellow-600">*</span>
                          </label>

                          <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            autoComplete="name"
                            required
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className={labelClass}>
                            Email Address{" "}
                            <span className="text-yellow-600">*</span>
                          </label>

                          <input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className={labelClass}>
                          Phone Number
                        </label>

                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+256 XXX XXX XXX"
                          aria-describedby="phone-help"
                          className={inputClass}
                        />

                        <p
                          id="phone-help"
                          className="mt-1.5 font-sans text-xs italic text-gray-500"
                        >
                          Optional — for event updates
                        </p>
                      </div>

                      <fieldset>
                        <legend className={labelClass}>
                          Will you attend?{" "}
                          <span className="text-yellow-600">*</span>
                        </legend>

                        <div className="flex flex-col gap-3">
                          {[
                            { value: "yes", label: "Yes, I will attend" },
                            {
                              value: "maybe",
                              label: "Possibly, to be confirmed",
                            },
                            { value: "no", label: "Unable to attend" },
                          ].map((option) => (
                            <label
                              key={option.value}
                              className={`flex cursor-pointer items-center rounded-md border p-3 transition-colors sm:p-4 ${
                                formData.attendance === option.value
                                  ? "border-gray-800 bg-white shadow-sm"
                                  : "border-gray-300 bg-gray-50 hover:border-gray-600"
                              }`}
                            >
                              <input
                                type="radio"
                                name="attendance"
                                required
                                value={option.value}
                                checked={
                                  formData.attendance === option.value
                                }
                                onChange={() =>
                                  handleAttendanceChange(option.value)
                                }
                                className="mr-3 h-4 w-4 shrink-0 accent-gray-800"
                              />

                              <span className="font-sans text-sm text-gray-800 sm:text-base">
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      {formData.attendance === "yes" && (
                        <div>
                          <label
                            htmlFor="guestCount"
                            className={labelClass}
                          >
                            Number of guests (including yourself){" "}
                            <span className="text-yellow-600">*</span>
                          </label>

                          <input
                            id="guestCount"
                            type="number"
                            name="guestCount"
                            min="1"
                            max="20"
                            step="1"
                            required
                            value={formData.guestCount}
                            onChange={handleInputChange}
                            placeholder="Enter number"
                            className={inputClass}
                          />
                        </div>
                      )}

                      <div>
                        <label htmlFor="notes" className={labelClass}>
                          Dietary restrictions or special requests
                        </label>

                        <textarea
                          id="notes"
                          name="notes"
                          rows={4}
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Please let us know of any dietary requirements, allergies, or other considerations..."
                          className={`${inputClass} resize-y`}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-gray-800 p-4 font-sans text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-gray-700 disabled:cursor-wait disabled:opacity-60 sm:text-base"
                      >
                        {isSubmitting
                          ? "Submitting..."
                          : "Submit Response"}
                      </button>
                    </form>
                  </>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}