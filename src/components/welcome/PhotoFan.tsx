import { cn } from "@/lib/utils";

const DEFAULT_PHOTOS = [
  "/welcome/fan-a.jpg",
  "/welcome/fan-b.jpg",
  "/welcome/fan-c.jpg",
] as const;

type PhotoFanProps = {
  photos?: readonly string[];
  className?: string;
};

/**
 * Trois cartes en éventail. Dimensions enfants en %, donc le parent
 * pilote la taille via `className` (mobile = 320px, desktop = 520px).
 */
export function PhotoFan({ photos = DEFAULT_PHOTOS, className }: PhotoFanProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative mx-auto aspect-[320/200] w-[320px]", className)}
    >
      <Photo src={photos[0]} positionClass="-translate-x-[90%] -rotate-12 z-10" />
      <Photo src={photos[2]} positionClass="-translate-x-[10%] rotate-12 z-20" />
      <Photo
        src={photos[1]}
        positionClass="-translate-x-1/2 -translate-y-[1%] z-30"
      />
    </div>
  );
}

function Photo({
  src,
  positionClass,
}: {
  src: string;
  positionClass: string;
}) {
  return (
    <div
      className={cn(
        "ring-secondary absolute top-[8%] left-1/2 h-[85%] w-[40%] origin-bottom rounded-2xl bg-cover bg-center shadow-xl ring-4",
        positionClass,
      )}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}
