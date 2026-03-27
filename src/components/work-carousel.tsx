"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import type { WorkSlide } from "@/lib/work-gallery";

type WorkCarouselProps = {
  ctaHref?: string;
  ctaLabel?: string;
  items: WorkSlide[];
  variant?: "home" | "page";
};

export function WorkCarousel({
  ctaHref,
  ctaLabel,
  items,
  variant = "home",
}: WorkCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex];

  const rotateForward = useEffectEvent(() => {
    setActiveIndex((current) => (current + 1) % items.length);
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      rotateForward();
    }, 4800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [items.length]);

  function goTo(index: number) {
    setActiveIndex(index);
  }

  function goPrevious() {
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  }

  function goNext() {
    setActiveIndex((current) => (current + 1) % items.length);
  }

  return (
    <div className={`work-carousel work-carousel-${variant}`}>
      <div className="work-carousel-stage">
        <Image
          alt={activeItem.alt}
          className="work-carousel-image"
          fill
          priority={activeIndex === 0}
          sizes="(max-width: 980px) 100vw, 88vw"
          src={activeItem.image}
        />

        <div className="work-carousel-overlay">
          <span className="work-carousel-word">{activeItem.word}</span>
          <span className="work-carousel-count">
            {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
        </div>

        <div className="work-carousel-arrows">
          <button
            aria-label="Previous work image"
            className="carousel-button"
            type="button"
            onClick={goPrevious}
          >
            Prev
          </button>
          <button
            aria-label="Next work image"
            className="carousel-button"
            type="button"
            onClick={goNext}
          >
            Next
          </button>
        </div>
      </div>

      <div className="work-carousel-caption">
        <div className="work-carousel-copy">
          <p className="eyebrow">Current shot</p>
          <h3 className="work-carousel-title">{activeItem.title}</h3>
          <p className="work-carousel-description">{activeItem.description}</p>
        </div>

        <div className="work-carousel-actions">
          {ctaHref && ctaLabel ? (
            <Link className="primary-button" href={ctaHref}>
              {ctaLabel}
            </Link>
          ) : null}
          <span className="work-carousel-hint">Tap a frame below or let the gallery rotate.</span>
        </div>
      </div>

      <div className="work-carousel-thumb-rail" role="tablist" aria-label="Work gallery shots">
        {items.map((item, index) => (
          <button
            key={item.image}
            aria-label={`Show ${item.word.toLowerCase()} work`}
            aria-selected={index === activeIndex}
            className={`work-carousel-thumb ${index === activeIndex ? "is-active" : ""}`}
            role="tab"
            type="button"
            onClick={() => goTo(index)}
          >
            <Image
              alt={item.alt}
              className="work-carousel-thumb-image"
              height={300}
              sizes="(max-width: 720px) 120px, 180px"
              src={item.image}
              width={400}
            />
            <span className="work-carousel-thumb-word">{item.word}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
