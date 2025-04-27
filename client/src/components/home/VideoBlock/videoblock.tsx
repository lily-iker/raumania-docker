"use client";

import { Bounded } from "@/components/Bounded";
import clsx from "clsx";
import Image from "next/image";

import { JSX } from "react";
import { LazyYouTubePlayer } from "./LazyYouTubePlayer";


const MASK_CLASSES =
  "[mask-image:url(/video-mask.png)] [mask-mode:alpha] [mask-position:center_center] [mask-repeat:no-repeat] [mask-size:100%_auto]";

type VideoBlockProps = {
  youtubeID: string;
};

const VideoBlock = ({ youtubeID }: VideoBlockProps): JSX.Element => {
  return (
    <Bounded className="bg-texture bg-zinc-900">
      <h2 className="sr-only">Video Reel</h2>
      <div className="relative aspect-video">
        {/* Mask overlays */}
        <div
          className={clsx(
            MASK_CLASSES,
            "bg-brand-lime absolute inset-0 ~translate-x-2/3 ~translate-y-2/3"
          )}
        />
        <div
          className={clsx(
            MASK_CLASSES,
            "bg-white absolute inset-0 ~translate-x-1/3 ~translate-y-1/2"
          )}
        />
        <div
          className={clsx(
            MASK_CLASSES,
            "bg-white absolute inset-0 ~translate-x-1/2 ~-translate-y-1/3"
          )}
        />

        {/* Lazy-loaded video */}
        <div className={clsx(MASK_CLASSES, "relative h-full")}>
          {youtubeID ? (
            <LazyYouTubePlayer youTubeID={youtubeID} />
          ) : null}

          {/* Texture overlay */}
          <Image
            src="/image-texture.png"
            alt=""
            fill
            className="pointer-events-none object-cover opacity-50"
          />
        </div>
      </div>
    </Bounded>
  );
};

export default VideoBlock;
