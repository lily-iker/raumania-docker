// components/TextAndImage.tsx

"use client";


import clsx from "clsx";
import { CSSProperties, JSX } from "react";

import { Bounded } from "@/components/Bounded";
import { ButtonLink } from "@/components/ButtonLink";
import { Heading } from "@/components/Heading";


import { SlideIn } from "../../SlideIn";
import { ParallaxImage } from "./ParallaxImage";

type Theme = "Blue" | "Orange" | "Navy" | "Lime"| "be"| "milk";

export type TextAndImageProps = {
  index: number;
  theme: Theme;
  heading: string;
  body: string;
  buttonText: string;
  buttonHref: string;
  variation?: "imageOnLeft" | "default";
  foregroundImage: string;
  backgroundImage: string;
};
const TextAndImage = ({
    index,
    theme,
    heading,
    body,
    buttonText,
    buttonHref,
    variation = "default",
    foregroundImage,
    backgroundImage,
  }: TextAndImageProps): JSX.Element => {
    return (
      <Bounded
        className={clsx(
          "sticky top-[calc(var(--index)*2rem)]",
          theme === "Blue" && "bg-texture bg-brand-blue text-white",
          theme === "Orange" && "bg-texture bg-brand-orange text-white",
          theme === "Navy" && "bg-texture bg-brand-navy text-white",
          theme === "Lime" && "bg-texture bg-brand-lime",
          theme === "be" && "bg-texture bg-brand-be",
          theme === "milk" && "bg-texture bg-brand-milk",
        )}
        style={{ "--index": index } as CSSProperties}
      >
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-24">
          <div
            className={clsx(
              "flex flex-col items-center gap-8 text-center md:items-start md:text-left",
              variation === "imageOnLeft" && "md:order-2"
            )}
          >
            <SlideIn>
              <Heading size="lg" as="h2">
                {heading}
              </Heading>
            </SlideIn>
            <SlideIn>
              <div className="max-w-md text-lg leading-relaxed">{body}</div>
            </SlideIn>
            <SlideIn> 
              <ButtonLink href={buttonHref} color={"yellow"}>
                {buttonText}
              </ButtonLink>
            </SlideIn>
            
          </div>
  
          <ParallaxImage
          foregroundImage={foregroundImage}
          backgroundImage={backgroundImage}
        />

        </div>
      </Bounded>
    );
  };
  
  export default TextAndImage;
  