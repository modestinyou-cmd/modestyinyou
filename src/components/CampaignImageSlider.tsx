'use client';

import Image from 'next/image';
import { useState, type KeyboardEvent, type PointerEvent } from 'react';

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function CampaignImageSlider() {
  const [position, setPosition] = useState(50);

  const updateFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPosition(clamp(((event.clientX - bounds.left) / bounds.width) * 100));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        setPosition((current) => clamp(current - step));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        setPosition((current) => clamp(current + step));
        break;
      case 'Home':
        event.preventDefault();
        setPosition(0);
        break;
      case 'End':
        event.preventDefault();
        setPosition(100);
        break;
    }
  };

  return (
    <div
      className="campaign-image-slider"
      role="slider"
      tabIndex={0}
      aria-label="Compare the Fall Edit portrait with its campaign artwork"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-valuetext={`${Math.round(position)}% campaign artwork revealed`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        updateFromPointer(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPointer(event);
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="campaign-image-base">
        <Image
          src="/images/fall-edit-campaign.JPG"
          alt="Fall Edit portrait without campaign lettering"
          fill
          sizes="(max-width: 640px) 88vw, (max-width: 900px) 90vw, 900px"
          priority
        />
      </div>
      <div className="campaign-image-overlay" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image
          src="/images/fall-edit-campaign-overlay.JPG"
          alt="The same Fall Edit portrait with its More Than Just a Hijab campaign lettering"
          fill
          sizes="(max-width: 640px) 88vw, (max-width: 900px) 90vw, 900px"
        />
      </div>
      <span className="campaign-image-label campaign-label-before" aria-hidden="true">Portrait</span>
      <span className="campaign-image-label campaign-label-after" aria-hidden="true">Campaign edit</span>
      <span className="campaign-image-divider" style={{ left: `${position}%` }} aria-hidden="true">
        <span className="campaign-image-handle">↔</span>
      </span>
    </div>
  );
}
