'use client';

import React, {useRef, useEffect, Reference } from 'react';
import dynamic from "next/dynamic";

import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from "gsap";

// Dynamically import the Editor with SSR disabled
const EditorApp = dynamic(
  () => import("@/lib/Editor/App"),
  { ssr: false }
);

interface EventHandlerFunction {
  (this: any, e: Event, ...args: any[]): void;
}

function once(
  el: EventTarget,
  event: string,
  fn: EventHandlerFunction,
  opts?: AddEventListenerOptions | boolean
): EventHandlerFunction {
  const onceFn = function(this: any, e: Event): void {
    el.removeEventListener(event, onceFn);
    fn.apply(this, [e]);
  };
  el.addEventListener(event, onceFn, opts);
  return onceFn;
}


gsap.registerPlugin(useGSAP, ScrollTrigger);

const SAMPLE_TEXT = '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Welcome to Conspecto, your intelligent note-taking companion.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"heading","version":1,"tag":"h1"},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Conspecto transforms how you take notes by ","type":"text","version":1},{"detail":0,"format":10,"mode":"normal","style":"","text":"challenging","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" your understanding. Our platform lets you create notes that ","type":"text","version":1},{"detail":0,"format":1,"mode":"normal","style":"","text":"actively","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" test your ","type":"text","version":1},{"detail":0,"format":9,"mode":"normal","style":"","text":"knowledge","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":".","type":"text","version":1},{"type":"linebreak","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"With ","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"background-color: #fedda7;font-size: 17px;","text":"Conspecto","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":", you can:","type":"text","version":1},{"type":"linebreak","version":1},{"detail":0,"format":16,"mode":"normal","style":"","text":"• ","type":"text","version":1},{"detail":0,"format":17,"mode":"normal","style":"","text":"Create","type":"text","version":1},{"detail":0,"format":16,"mode":"normal","style":"","text":" interactive notes with embedded questions","type":"text","version":1},{"type":"linebreak","version":1},{"detail":0,"format":16,"mode":"normal","style":"","text":"• ","type":"text","version":1},{"detail":0,"format":18,"mode":"normal","style":"","text":"Quiz","type":"text","version":1},{"detail":0,"format":16,"mode":"normal","style":"","text":" yourself on key concepts as you review","type":"text","version":1},{"type":"linebreak","version":1},{"detail":0,"format":16,"mode":"normal","style":"","text":"• ","type":"text","version":1},{"detail":0,"format":24,"mode":"normal","style":"","text":"Track","type":"text","version":1},{"detail":0,"format":16,"mode":"normal","style":"","text":" your understanding over time","type":"text","version":1},{"type":"linebreak","version":1},{"detail":0,"format":16,"mode":"normal","style":"","text":"• ","type":"text","version":1},{"detail":0,"format":16,"mode":"normal","style":"color: #875400;","text":"Strengthen ","type":"text","version":1},{"detail":0,"format":16,"mode":"normal","style":"color: #26221a;","text":"your retention through active recall","type":"text","version":1},{"type":"linebreak","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":"Unlike passive note-taking, Conspecto creates a ","type":"text","version":1},{"detail":0,"format":1,"mode":"normal","style":"","text":"dynamic learning experience","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" that ","type":"text","version":1},{"detail":0,"format":2,"mode":"normal","style":"","text":"forces","type":"text","version":1},{"detail":0,"format":0,"mode":"normal","style":"","text":" you to engage with your material in a meaningful way!","type":"text","version":1},{"type":"linebreak","version":1},{"detail":0,"format":0,"mode":"normal","style":"color: #000000;","text":"Start transforming your notes into powerful learning tools ","type":"text","version":1},{"detail":0,"format":11,"mode":"normal","style":"color: #000000;","text":"today","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textStyle":"background-color: #fedda7;font-size: 17px;","textFormat":0}],"direction":"ltr","format":"","indent":0,"type":"root","version":1,"textStyle":"background-color: #fedda7;font-size: 17px;"}}';

function ScrollHighlightEditor ({page}: {page: React.RefObject<HTMLDivElement> | null}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const src = video.currentSrc || video.src;

      once(document.documentElement, "touchstart", function (e) {
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
              once(document.documentElement, "touchstart", function (e) {
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