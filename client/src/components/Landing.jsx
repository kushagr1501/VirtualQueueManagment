import React, { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";

function Landing() {
  const navigate = useNavigate();
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const cursorRef = useRef(null);
  const tickerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".split-panel", { y: "100%", duration: 1.5, ease: "power4.out", stagger: 0.1 });

      const moveCursor = (e) => {
        gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
      };
      window.addEventListener("mousemove", moveCursor);

      gsap.to(".timer-digit", {
        innerHTML: 0,
        duration: 30,
        snap: { innerHTML: 1 },
        repeat: -1,
        yoyo: true,
        ease: "none",
        modifiers: {
          innerHTML: function (value) { return Math.abs(Math.round(value)) }
        }
      });

      gsap.to(tickerRef.current, {
        y: "-50%",
        duration: 20,
        ease: "linear",
        repeat: -1
      });

    });
    return () => ctx.revert();
  }, []);

  const handleMouseEnter = (side) => {
    if (window.innerWidth < 768) return;


    const targetLeft = side === "left" ? "65%" : "35%";
    const targetRight = side === "left" ? "35%" : "65%";

    gsap.to(leftRef.current, { width: targetLeft, duration: 0.8, ease: "power3.inOut" });
    gsap.to(rightRef.current, { width: targetRight, duration: 0.8, ease: "power3.inOut" });


    gsap.to(`.content-${side}`, { scale: 1.05, opacity: 1, duration: 0.5 });
    gsap.to(`.content-${side === "left" ? "right" : "left"}`, { scale: 0.95, opacity: 0.5, duration: 0.5 });


    gsap.to(cursorRef.current, { scale: 3, mixBlendMode: "difference", duration: 0.3 });
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 768) return;
    gsap.to([leftRef.current, rightRef.current], { width: "50%", duration: 0.8, ease: "power3.inOut" });
    gsap.to([".content-left", ".content-right"], { scale: 1, opacity: 1, duration: 0.5 });
    gsap.to(cursorRef.current, { scale: 1, mixBlendMode: "normal", duration: 0.3 });
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col md:flex-row font-sans selection:bg-orange-500 selection:text-white cursor-none">


      <div ref={cursorRef} className="fixed w-6 h-6 bg-orange-500 rounded-full pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:block"></div>


      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 mix-blend-exclusion pointer-events-none">
        <span className="text-xl font-bold text-white tracking-widest uppercase">QueueBoard</span>
      </div>


      <div
        ref={leftRef}
        onMouseEnter={() => handleMouseEnter("left")}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate("/home")}
        className="split-panel relative w-full md:w-1/2 h-1/2 md:h-full bg-[#f2f2f2] text-black flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-black/10 cursor-pointer"
      >

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-[30vw] text-[#e5e5e5] select-none pointer-events-none font-mono">
          0<span className="timer-digit">4</span>
        </div>

        <div className="content-left relative z-10 text-center max-w-md px-6">
          <div className="bg-black text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-8">
            User Flow
          </div>
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-[0.9]">
            Skip<br />the Wait
          </h2>
          <p className="text-xl text-gray-500 mb-10 font-medium">
            Scan QR. Get Ticket. Relax.
          </p>
          <button className="text-lg font-bold border-b-2 border-black pb-1 hover:text-orange-600 hover:border-orange-600 transition-colors flex items-center gap-2 mx-auto">
            Join Queue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>


      <div
        ref={rightRef}
        onMouseEnter={() => handleMouseEnter("right")}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate("/business/login")}
        className="split-panel relative w-full md:w-1/2 h-1/2 md:h-full bg-[#0a0a0a] text-white flex items-center justify-center overflow-hidden cursor-pointer"
      >

        <div className="absolute inset-0 opacity-10 font-mono text-sm leading-relaxed p-10 overflow-hidden pointer-events-none">
          <div ref={tickerRef} className="space-y-2">
            {Array(40).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between">
                <span>TOKEN_{2490 + i}</span>
                <span>VERIFIED</span>
                <span>{["OPD", "TELLER", "ADMIN", "CHECKOUT"][i % 4]}</span>
                <span className="text-green-500">ACTIVE</span>
              </div>
            ))}
            {Array(40).fill(0).map((_, i) => (
              <div key={`dup-${i}`} className="flex justify-between">
                <span>TOKEN_{2490 + i}</span>
                <span>VERIFIED</span>
                <span>{["OPD", "TELLER", "ADMIN", "CHECKOUT"][i % 4]}</span>
                <span className="text-green-500">ACTIVE</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-right relative z-10 text-center max-w-md px-6">
          <div className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-8">
            Admin Flow
          </div>
          <h2 className="text-6xl md:text-8xl font-serif italic font-medium tracking-tight mb-6 leading-[0.9]">
            Control<br />Chaos
          </h2>
          <p className="text-xl text-gray-400 mb-10 font-medium">
            Monitor flow. Verify tokens. Optimize data.
          </p>
          <div className="flex gap-8 justify-center">
            <button className="text-lg font-bold border-b-2 border-white pb-1 hover:text-orange-500 hover:border-orange-500 transition-colors">
              Login
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate("/business/signup"); }}
              className="px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-orange-500 hover:text-white transition-colors"
            >
              Start Free
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Landing;
