/**
 * @file gsapSetup.js
 * @description Registers the GSAP plugins used by the flight journey exactly once.
 * Import gsap / ScrollTrigger from here so registration always happens first.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Mobile address-bar show/hide resizes the viewport; don't re-layout pins for it.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, useGSAP };
