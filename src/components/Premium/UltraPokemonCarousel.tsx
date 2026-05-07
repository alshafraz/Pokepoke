'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules';
import UltraPokemonCard from './UltraPokemonCard';
import TypeBackground from './TypeBackground';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface UltraPokemonCarouselProps {
  pokemonList: any[];
}

export default function UltraPokemonCarousel({ pokemonList }: UltraPokemonCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePokemon = pokemonList[activeIndex];

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background */}
      {activePokemon && (
        <TypeBackground type={activePokemon.types[0]} />
      )}

      {/* Title / Info Overlay */}
      <div className="absolute top-20 text-center z-20">
        <h2 className="text-[10px] font-black tracking-[0.5em] text-sky-500 uppercase mb-4 animate-pulse">
          Featured Discoveries
        </h2>
        <div className="flex items-baseline gap-4">
          <h1 className="text-7xl font-black italic tracking-tighter text-white uppercase neon-text">
            {activePokemon?.name}
          </h1>
          <span className="text-3xl font-black text-white/20 italic">
            #{String(activePokemon?.dexNumber || activePokemon?.id).padStart(3, '0')}
          </span>
        </div>
      </div>

      {/* Swiper Carousel */}
      <div className="w-full max-w-[1400px] mt-20 relative z-10">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={true}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 200,
            modifier: 1.5,
            slideShadows: false,
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="ultra-swiper !py-20"
        >
          {pokemonList.map((pokemon, index) => (
            <SwiperSlide key={pokemon.id} className="!w-fit">
              <UltraPokemonCard 
                pokemon={pokemon} 
                isActive={activeIndex === index} 
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation */}
        <button className="swiper-button-prev-custom absolute left-10 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center text-white hover:bg-sky-500 hover:border-sky-400 transition-all group">
          <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <button className="swiper-button-next-custom absolute right-10 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center text-white hover:bg-sky-500 hover:border-sky-400 transition-all group">
          <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Particle Overlay (Fixed) */}
      <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
    </div>
  );
}
