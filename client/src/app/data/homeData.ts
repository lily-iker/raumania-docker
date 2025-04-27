import { TextAndImageProps } from "@/components/home/TextAndImage/TextAndImage";

export const heroData = {
    heading: "Elevate Your Senses with Timeless Scents",
    body: "At Raumania Fragrance, we craft luxurious scents that capture emotions, memories, and moments. Each fragrance is designed to elevate your senses, blending the finest ingredients to create timeless aromas.",
    buttonText: "Custom Your Perfumes",
    buttonHref: "/build",
    color: "yellow",
  };
  
  export const productsData = [
    {
      id: "perfume-1",
      name: "Velvet Bloom",
      imageUrl: "/images/fragrance/VelvetBloom.png",
      price: 50000000,
      customizeUrl: "/customize/street-rocket",
    },
    {
        id: "perfume-2",
        name: "Velvet Bloom",
        imageUrl: "/images/fragrance/VelvetBloom.png",
        price: 50000000,
        customizeUrl: "/customize/street-rocket",
      },
      {
        id: "perfume-3",
        name: "Velvet Bloom",
        imageUrl: "/images/fragrance/VelvetBloom.png",
        price: 50000000,
        customizeUrl: "/customize/street-rocket",
      },
      {
        id: "perfume-4",
        name: "Velvet Bloom",
        imageUrl: "/images/fragrance/VelvetBloom.png",
        price: 50000000,
        customizeUrl: "/customize/street-rocket",
      },
    
    // Bạn có thể thêm các sản phẩm khác tại đây
  ];
  
  export const textAndImageSlices: TextAndImageProps[] = [
    {
      index: 1,
      theme: "be",
      heading: "I want to leave a trace that lingers beautifully.",
      body: "At Raumania, our debut fragrance marks more than a scent—it’s the beginning of a story. Rooted in elegance and purpose, we craft each note with care for the world we share. Our commitment to sustainability, ethical sourcing, and timeless design reflects a deeper mission: to inspire confidence, celebrate identity, and leave behind something unforgettable.",
      buttonText: "Shop Now",
      buttonHref: "/products",
      variation: "imageOnLeft",
      foregroundImage: "/images/poster.png",
      backgroundImage: "/images/paint-background.png",
    },
    {
      index: 2,
      theme: "milk",
      heading: "I want to be part of what’s coming next",
      body: "At Raumania, our sustainability efforts are rooted in the belief that we must focus where we can make the most meaningful difference. We are committed to restoring nature, protecting the climate, investing in circularity, and championing dignity and opportunity for all—especially by advancing women’s autonomy.",
      buttonText: "Shop Now",
      buttonHref: "/products",
      variation: "default",
      foregroundImage: "/images/poster-2.png",
      backgroundImage: "/images/paint-background.png",
    },
    {
      index: 3,
      theme: "be",
      heading: "Weaving Scents, Crafting Dreams",
      body: "At Raumania Fragrance, every drop tells a story. Founded by Nhungnguoiae36, we invite you to a journey where nature’s purest gifts — blossoms, herbs, and oils — are blended by your own hands into a fragrance that is uniquely yours. Here, crafting your perfume is more than creation; it is a celebration of spirit, freedom, and the timeless beauty that blooms within.",
      buttonText: "Shop Now",
      buttonHref: "/products",
      variation: "imageOnLeft",
      foregroundImage: "/images/customperfume.jpg",
      backgroundImage: "/images/paint-background.png",
    },
  ];
