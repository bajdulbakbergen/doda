"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";

type Props = {
  name: string;
  defaultValue?: number;
  required?: boolean;
};

export function StarRatingInput({ name, defaultValue = 0, required }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="inline-flex items-center gap-1">
      <input type="hidden" name={name} value={value} required={required} />
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => setValue(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          aria-label={String(i)}
          className={cn(
            "text-2xl leading-none transition-colors",
            i <= display ? "text-amber-500" : "text-foreground/20 hover:text-amber-300",
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
}
