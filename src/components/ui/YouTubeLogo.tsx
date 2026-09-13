const base = import.meta.env.BASE_URL ?? '/';
const logoWebp = `${base.replace(/\/+$/, '')}/logo.webp`;
const logoPng = `${base.replace(/\/+$/, '')}/logo.png`;

interface YouTubeLogoProps {
  className?: string;
  alt?: string;
}

export function YouTubeLogo({ className = 'w-7 h-7', alt = 'Logo' }: YouTubeLogoProps) {
  return (
    <picture className={`${className} inline-flex items-center justify-center shrink-0`}>
      <source type="image/webp" srcSet={logoWebp} />
      <source type="image/png" srcSet={logoPng} />
      <img
        src={logoWebp}
        alt={alt}
        className="w-full h-full object-contain select-none"
        loading="eager"
        draggable={false}
      />
    </picture>
  );
}

export const AppLogo = YouTubeLogo;


