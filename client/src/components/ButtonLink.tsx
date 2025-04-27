import { FaCartShopping, FaPlus } from "react-icons/fa6";
import { GiDelicatePerfume } from "react-icons/gi";
import clsx from "clsx";
import Link from "next/link";
import { ComponentProps } from "react";
import { Eye } from "lucide-react"


export type ButtonProps = {
  color?: "orange" | "purple" | "lime"|"pink"|"yellow";
  size?: "lg" | "sm" | "md" | "icon"
  icon?: "cart" | "GiDelicatePerfume" | "plus" | "eye";
} & ComponentProps<typeof Link>;

export function ButtonLink({
  color = "orange",
  size = "md",
  icon,
  children,
  className,
  ...props
}: ButtonProps) {
  const icons = {
    cart: <FaCartShopping />,
    plus: <FaPlus />,
    GiDelicatePerfume: <GiDelicatePerfume />,
    eye: <Eye />,
  };

  return (
    <Link
      className={clsx(
        "button-cutout group mx-4 inline-flex items-center bg-gradient-to-b from-25% to-75% bg-[length:100%_400%] font-bold transition-[filter,background-position] duration-300 hover:bg-bottom",
        size === "sm" && "gap-2.5 py-2 text-base",
        size === "md" && "gap-3 px-1 text-lg py-2.5",
        size === "lg" && "text-xl gap-4 px-2 py-3",
        color === "orange" &&
          "from-brand-orange to-brand-lime text-black hover:text-black",
        color === "purple" &&
          "from-brand-purple to-brand-lime text-white hover:text-black",
        color === "lime" &&
          "from-brand-lime to-brand-orange text-black hover:text-black",
        
        color === "pink" &&
          "from-brand-pinkbutton to-brand-yellowbutton text-black hover:text-black",
        
        color === "yellow" &&
          "from-brand-yellowbutton to-brand-purple text-black hover:text-black",
        className,
      )}
      {...props}
    >
      {icon && (
        <>
          <div
            className={clsx(
              "flex items-center justify-center transition-transform group-hover:-rotate-[25deg] [&>svg]:h-full [&>svg]:w-full",
              size === "sm" && "size-5",
              size === "md" && "size-6",
              size === "lg" && "size-8",
            )}
          >
            {icons[icon]}
          </div>
          <div className="w-px self-stretch bg-black/25" />
        </>
      )}
      {children}
    </Link>
  );
}
