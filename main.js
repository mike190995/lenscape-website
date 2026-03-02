import './style.css'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// --- Wait State & Preloading ---
const frameCount = 177
const images = []
let imagesLoaded = 0

const currentFrame = index => (
    `/hero/lenscape glambot_17902106327947948917_sample_${(1000 + index).toString()}.png`
)

function preloadImages() {
    return new Promise((resolve) => {
        for (let i = 0; i < frameCount; i++) {
            const img = new Image()
            img.onload = () => {
                imagesLoaded++
                if (imagesLoaded === frameCount) resolve()
            }
            img.onerror = () => {
                imagesLoaded++ // Still increment to avoid hang
                if (imagesLoaded === frameCount) resolve()
            }
            img.src = currentFrame(i)
            images.push(img)
        }
    })
}

Promise.all([document.fonts.ready, preloadImages()]).then(() => {
    const loader = document.getElementById('loader')
    gsap.to(loader, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
        onComplete: initInteractions
    })
})

function initInteractions() {
    // --- Lenis Smooth Scroll ---
    const lenis = new Lenis({
        duration: 1.5, // Increased for more weight
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        lerp: 0.1 // Added for smoother inertia
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    // --- Hero Image Sequence Animation ---
    const canvas = document.getElementById('hero-canvas')
    const context = canvas.getContext('2d', { alpha: false }) // Optimization

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'

    const airship = {
        frame: 0,
        x: window.innerWidth * 0.15,
        y: window.innerHeight * 0.15
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth * window.devicePixelRatio
        canvas.height = window.innerHeight * window.devicePixelRatio
        render()
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    function render() {
        if (!images[airship.frame]) return

        const img = images[airship.frame]
        const canvasAspect = canvas.width / canvas.height
        const imgAspect = img.width / img.height

        let drawWidth, drawHeight, offsetX, offsetY

        if (canvasAspect > imgAspect) {
            drawWidth = canvas.width
            drawHeight = canvas.width / imgAspect
            offsetX = 0
            offsetY = (canvas.height - drawHeight) / 2
        } else {
            drawHeight = canvas.height
            drawWidth = canvas.height * imgAspect
            offsetX = (canvas.width - drawWidth) / 2
            offsetY = 0
        }

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(img, offsetX + airship.x, offsetY + airship.y, drawWidth, drawHeight)
    }

    // Hero Timeline
    const heroTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.hero-scroll-container',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5, // Numerical scrub for "smooth follow"
            onUpdate: render
        }
    })

    // Image Sequence
    heroTl.to(airship, {
        frame: frameCount - 1,
        snap: 'frame',
        ease: 'none',
        duration: 5
    }, 0)

    // Entrance Offset Easing (Center at t=2 when basic-package is fully in frame)
    heroTl.to(airship, {
        x: 0,
        y: 0,
        duration: 2,
        ease: 'power1.out'
    }, 0)

    // Main Hero Content Fade Out
    heroTl.to('.main-hero', {
        opacity: 0,
        y: -100,
        duration: 0.5
    }, 0.2)

    // Basic Package Fade In/Out
    heroTl.to('#basic-package', {
        autoAlpha: 1,
        duration: 1,
        ease: 'power2.inOut'
    }, 1)
    heroTl.to('#basic-package', {
        autoAlpha: 0,
        duration: 1,
        ease: 'power2.inOut'
    }, 2.5)

    // Glam Package Fade In/Out
    heroTl.to('#glam-package', {
        autoAlpha: 1,
        duration: 1,
        ease: 'power2.inOut'
    }, 3.5)
    heroTl.to('#glam-package', {
        autoAlpha: 0,
        duration: 1,
        ease: 'power2.inOut'
    }, 4.8)

    // Exit Parallax Effect
    heroTl.to('.hero-sticky', {
        y: '-15%',
        scale: 0.9,
        opacity: 0.5,
        duration: 1,
        ease: 'none'
    }, 5) // At the very end of the sequence

    // --- Magnetic Cursor ---
    const cursor = document.querySelector('.custom-cursor')
    let mouseX = 0, mouseY = 0
    let cursorX = 0, cursorY = 0

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX
        mouseY = e.clientY
    })

    gsap.ticker.add(() => {
        cursorX += (mouseX - cursorX) * 0.15
        cursorY += (mouseY - cursorY) * 0.15
        gsap.set(cursor, { x: cursorX, y: cursorY })
    })

    const hoverTargets = document.querySelectorAll('.hover-target, a')
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 3, opacity: 0.5, duration: 0.3, ease: 'power2.out' })
        })
        target.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' })
        })
    })

    // --- The Artifact Gallery ---
    const cards = gsap.utils.toArray('.artifact-card')
    cards.forEach((card, i) => {
        gsap.fromTo(card,
            { y: 150, opacity: 0, rotationZ: i % 2 === 0 ? 5 : -5 },
            {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    end: 'top 60%',
                    scrub: 1
                },
                y: 0,
                opacity: 1,
                rotationZ: 0,
                ease: 'power2.out'
            }
        )
    })

    // --- Marquee ---
    gsap.to('.marquee-track', {
        xPercent: -50,
        ease: "none",
        duration: 15,
        repeat: -1
    })

    // --- Philosophy Section Asymmetrical Scroll ---
    gsap.from('.phil-col.left', {
        scrollTrigger: {
            trigger: '.philosophy-section',
            start: 'top 70%',
            end: 'bottom top',
            scrub: 1
        },
        y: 100,
        opacity: 0.5
    })

    gsap.from('.phil-col.right', {
        scrollTrigger: {
            trigger: '.philosophy-section',
            start: 'top 80%',
            end: 'bottom top',
            scrub: 1.5
        },
        y: 200,
        opacity: 0
    })

    // --- Header Scroll Transparency Animation ---
    const headers = gsap.utils.toArray('h2, h3').filter(h => !h.closest('.hero-scroll-container'))

    headers.forEach(header => {
        gsap.timeline({
            scrollTrigger: {
                trigger: header,
                start: 'top 100%',
                end: 'top -25%',
                scrub: true
            }
        })
            .fromTo(header, { opacity: 0 }, { opacity: 1, duration: 0.3 }) // Fade in
            .to(header, { opacity: 1, duration: 0.4 }) // Hold at 100%
            .to(header, { opacity: 0.2, duration: 0.3 }) // Fade out
    })

    // --- Realtime Clock ---
    setInterval(() => {
        const timeSpan = document.getElementById('hero-time')
        if (timeSpan) {
            const now = new Date()
            timeSpan.innerText = `| TIME: ${now.toLocaleTimeString('en-US', { hour12: false })} | SYS.OK`
        }
    }, 1000)
}
