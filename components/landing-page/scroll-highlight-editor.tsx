'use client';

import React, {useRef, useEffect } from 'react';

import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from "gsap";

interface EventHandlerFunction {
  (this: unknown, e: Event, ...args: unknown[]): void;
}

function once(
  el: EventTarget,
  event: string,
  fn: EventHandlerFunction,
  opts?: AddEventListenerOptions | boolean
): EventHandlerFunction {
  const onceFn = function(this: unknown, e: Event): void {
    el.removeEventListener(event, onceFn);
    fn.apply(this, [e]);
  };
  el.addEventListener(event, onceFn, opts);
  return onceFn;
}


gsap.registerPlugin(useGSAP, ScrollTrigger);

function ScrollHighlightEditor () {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const src = video.currentSrc || video.src;

      once(document.documentElement, "touchstart", function () {
        video.play();
        video.pause();
      });
      setTimeout(function () {
        if (window["fetch"]) {
          fetch(src)
            .then((response) => response.blob())
            .then((response) => {
              const blobURL = URL.createObjectURL(response);

              const t = video.currentTime;
              once(document.documentElement, "touchstart", function () {
                video.play();
                video.pause();
              });

              video.setAttribute("src", blobURL);
              video.currentTime = t + 0.01;
            });
        }
      }, 1000);
    }
  }, []);

  useGSAP(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const tl = gsap.timeline({
        defaults: { duration: 1 },
        scrollTrigger: {
          trigger: videoRef.current,
          pin: true,
          start: "center center",
          end: "+=4000",
          scrub: true,
        }
      });
      console.log("Video duration: ", video.duration);
      once(video, "loadedmetadata", () => {
        tl.fromTo(
          video,
          {
            currentTime: 0
          },
          {
            currentTime: video.duration || 1
          }
        );
      });
    }
  })

  return (
    <div>
      <div>
      <video ref={videoRef} playsInline={true} webkit-playsinline="true" preload="auto" muted={true}>
        <source src="/landing/editor_create.mp4" type="video/mp4" />
        Your browser does not support the video.
      </video>
      </div>
      {/* <EditorApp content={SAMPLE_TEXT} /> */}
    </div>
  );
};

export default ScrollHighlightEditor;