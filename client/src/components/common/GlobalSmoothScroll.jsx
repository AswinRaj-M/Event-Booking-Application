import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';

const GlobalSmoothScroll = () => {
  const location = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      prevent: (node) => {
        if (!node) return false;
        if (node.hasAttribute && node.hasAttribute('data-lenis-prevent')) return true;
        if (node.classList && (node.classList.contains('overflow-y-auto') || node.classList.contains('overflow-auto'))) return true;
        return false;
      }
    });

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    window.lenis = lenis;

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  // Pause Lenis smooth scrolling on dashboard routes (admin & vendor) to allow native inner scrolling
  useEffect(() => {
    const isDashboardRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/vendor');
    if (window.lenis) {
      if (isDashboardRoute) {
        window.lenis.stop();
      } else {
        window.lenis.start();
        window.lenis.scrollTo(0, { immediate: true });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return null;
};

export default GlobalSmoothScroll;
