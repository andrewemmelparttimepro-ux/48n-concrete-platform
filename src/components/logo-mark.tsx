import Image from "next/image";

type LogoMarkProps = {
  className?: string;
  compact?: boolean;
};

export function LogoMark({ className, compact = false }: LogoMarkProps) {
  return (
    <div className={["brand-lockup", compact ? "brand-lockup-compact" : "", className]
      .filter(Boolean)
      .join(" ")}>
      <Image
        alt="48 North Concrete"
        className="brand-image"
        height={590}
        priority={compact}
        sizes={compact ? "(max-width: 768px) 170px, 190px" : "(max-width: 768px) 250px, 320px"}
        src="/48n-logo-lockup.png"
        width={1456}
      />
    </div>
  );
}
