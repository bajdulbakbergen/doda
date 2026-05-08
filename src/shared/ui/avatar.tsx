import Image from "next/image";
import { cn } from "@/shared/lib/cn";

type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
};

export function Avatar({ src, alt, size = 40, className }: AvatarProps) {
  const initials = getInitials(alt);

  return (
    <div
      className={cn(
        "bg-foreground/10 text-foreground/70 relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.4)) }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
