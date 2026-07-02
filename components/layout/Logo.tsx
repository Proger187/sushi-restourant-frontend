import Image from "next/image";
import Link from "next/link";

interface Props {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  href?: string;
}

const sizes = {
  sm: { img: 32, text: "text-base" },
  md: { img: 40, text: "text-xl" },
  lg: { img: 64, text: "text-3xl" },
};

export default function Logo({ size = "md", showName = true, href = "/" }: Props) {
  const { img, text } = sizes[size];
  return (
    <Link href={href} className="flex items-center gap-2">
      <Image
        src="/logo.jpg"
        alt="Sushi Garden"
        width={img}
        height={img}
        className="rounded-full object-cover"
        priority
      />
      {showName && (
        <span className={`font-heading font-semibold text-white ${text}`}>
          Sushi Garden
        </span>
      )}
    </Link>
  );
}
