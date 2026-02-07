'use client';

import { useEffect } from 'react';

export default function HeygenAvatar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const existingWidget = document.getElementById('heygen-streaming-embed');
    if (existingWidget) {
      console.log('HeyGen widget już istnieje');
      return;
    }

    console.log('Inicjalizacja HeyGen widget...');

    const host = "https://labs.heygen.com";
    const url = host + "/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJLYXR5YV9DYXN1YWxMb29rX3B1YmxpYyIs%0D%0AInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzLzViMWRiN2Uy%0D%0AMDgwZjQxMDZhODViOTg3NDM3NDMwYTI0XzU1ODYwL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJuZWVk%0D%0AUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjlmOTM1NDE5MTk3ODQ4%0D%0ANmNiNjlmNzM0YmMxZmIxNTRiIiwidXNlcm5hbWUiOiI4YmVhODkwOTI0MDA0ZWUwYWYwMTc5YjIz%0D%0AZmRmMjIyYiJ9&inIFrame=1";
    
    const clientWidth = window.innerWidth || document.body.clientWidth;
    
    const wrapDiv = document.createElement("div");
    wrapDiv.id = "heygen-streaming-embed";
    
    const container = document.createElement("div");
    container.id = "heygen-streaming-container";
    
    const stylesheet = document.createElement("style");
    stylesheet.innerHTML = `
      #heygen-streaming-embed {
        z-index: 9999;
        position: fixed;
        /* CENTROWANIE NA ŚRODKU */
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        /* ROZMIAR */
        width: ${clientWidth < 768 ? '90%' : '600px'};
        height: ${clientWidth < 768 ? '400px' : '500px'};
        max-width: 800px;
        /* STYLE */
        border-radius: 16px;
        border: 2px solid #fff;
        box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        background: white;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      #heygen-streaming-embed.show {
        opacity: 1 !important;
        visibility: visible !important;
      }
      #heygen-streaming-embed.expand {
        width: ${clientWidth < 768 ? '95%' : '900px'};
        height: ${clientWidth < 768 ? '80vh' : '700px'};
      }
      #heygen-streaming-container {
        width: 100%;
        height: 100%;
      }
      #heygen-streaming-container iframe {
        width: 100%;
        height: 100%;
        border: 0;
      }
    `;
    
    const iframe = document.createElement("iframe");
    iframe.setAttribute('allowfullscreen', 'false');
    iframe.setAttribute('title', 'Streaming Embed');
    iframe.setAttribute('role', 'dialog');
    iframe.setAttribute('allow', 'microphone');
    iframe.src = url;
    
    let visible = false;
    let initial = false;
    
    const messageHandler = (e: MessageEvent) => {
      if (e.origin !== host) return;
      if (!e.data || !e.data.type || e.data.type !== "streaming-embed") return;
      
      console.log('HeyGen message:', e.data.action);
      
      if (e.data.action === "init") {
        initial = true;
        wrapDiv.classList.add("show");
        console.log('HeyGen initialized - widget should be visible now');
      } else if (e.data.action === "show") {
        visible = true;
        wrapDiv.classList.add("expand");
      } else if (e.data.action === "hide") {
        visible = false;
        wrapDiv.classList.remove("expand");
      }
    };
    
    window.addEventListener("message", messageHandler);
    
    container.appendChild(iframe);
    wrapDiv.appendChild(stylesheet);
    wrapDiv.appendChild(container);
    document.body.appendChild(wrapDiv);
    
    console.log('HeyGen widget dodany do DOM (centrum ekranu)');
    
    return () => {
      console.log('Cleanup HeyGen widget');
      window.removeEventListener("message", messageHandler);
      const widget = document.getElementById('heygen-streaming-embed');
      if (widget) {
        widget.remove();
      }
    };
  }, []);

  return null;
}