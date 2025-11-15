'use client';

import Slider from 'react-slick';
import { TechLogo } from './TechLogo';
import { cn } from '@/lib/utils';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface TechSkillsCarouselProps {
  skills: string[];
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

const speedMap = {
  slow: 10000,
  normal: 6000,
  fast: 4000,
};

export function TechSkillsCarousel({
  skills,
  className,
  speed = 'normal',
}: TechSkillsCarouselProps) {
  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    speed: speedMap[speed],
    autoplaySpeed: 0,
    cssEase: 'linear',
    pauseOnHover: false,
    arrows: false,
    swipeToSlide: false,
    draggable: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <div className={cn('relative tech-skills-slider', className)}>
      {/* Gradient overlays for fade effect */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

      <Slider {...settings}>
        {skills.map((skill, index) => (
          <div key={`${skill}-${index}`} className="px-3 py-8">
            <div className="group flex items-center justify-center">
              <div className="relative">
                <TechLogo
                  name={skill}
                  className="transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                />
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20">
                  <span className="text-xs font-medium text-muted-foreground bg-card px-2 py-1 rounded-md shadow-md border border-border">
                    {skill}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
