import { useEffect, useRef, useState, useCallback } from 'react';

const SLIDE_IMAGES = [
  { src: '/air jorden.png', alt: 'Air Jordan sneaker', label: 'Air Jordan' },
  { src: '/images/running_animate.png', alt: 'Running shoes', label: 'Running' },
  { src: '/images/formal_animate.png', alt: 'Formal dress shoes', label: 'Formal' },
  { src: '/images/basketball_animate.png', alt: 'Basketball shoes', label: 'Basketball' },
];

const AUTO_PLAY_INTERVAL = 3000;

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartTime, setTouchStartTime] = useState(null);
  const autoplayRef = useRef(null);

  // Preload all images
  useEffect(() => {
    SLIDE_IMAGES.forEach(img => {
      const image = new window.Image();
      image.src = img.src;
    });
  }, []);

  // Use a timeout so every manual navigation gets a fresh three-second delay.
  useEffect(() => {
    if (isHovered) return undefined;

    autoplayRef.current = window.setTimeout(() => {
      setActiveIndex(prev => (prev + 1) % SLIDE_IMAGES.length);
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (autoplayRef.current) window.clearTimeout(autoplayRef.current);
    };
  }, [activeIndex, isHovered]);

  const goToSlide = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((activeIndex + 1) % SLIDE_IMAGES.length);
  }, [activeIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((activeIndex - 1 + SLIDE_IMAGES.length) % SLIDE_IMAGES.length);
  }, [activeIndex, goToSlide]);

  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartTime(Date.now());
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    const diffTime = Date.now() - (touchStartTime || 0);

    if (Math.abs(diffX) > 40 || (Math.abs(diffX) > 20 && diffTime < 300)) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
    setTouchStartTime(null);
  }, [touchStartX, touchStartTime, nextSlide, prevSlide]);

  return (
    <section
      className="hero-carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="hero-carousel__track"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {SLIDE_IMAGES.map((image, index) => {
          const isActive = index === activeIndex;
          const isPrev = index === (activeIndex - 1 + SLIDE_IMAGES.length) % SLIDE_IMAGES.length;
          const isNext = index === (activeIndex + 1) % SLIDE_IMAGES.length;
          return (
            <div
              key={image.label}
              className={`hero-carousel__slide ${isActive ? 'hero-carousel__slide--active' : ''} ${isPrev ? 'hero-carousel__slide--prev' : ''} ${isNext ? 'hero-carousel__slide--next' : ''}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="hero-carousel__image"
                loading={isActive ? 'eager' : 'lazy'}
                onError={(event) => { event.currentTarget.src = '/shoe-fallback.svg'; }}
              />
            </div>
          );
        })}
      </div>

      <button
        className="hero-carousel__nav hero-carousel__nav--prev"
        onClick={prevSlide}
        aria-label="Previous shoe"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <button
        className="hero-carousel__nav hero-carousel__nav--next"
        onClick={nextSlide}
        aria-label="Next shoe"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
      </button>

      <div className="hero-carousel__dots">
        {SLIDE_IMAGES.map((_, index) => (
          <button
            key={index}
            className={`hero-carousel__dot ${index === activeIndex ? 'hero-carousel__dot--active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === activeIndex ? 'true' : 'false'}
          />
        ))}
      </div>
    </section>
  );
}
