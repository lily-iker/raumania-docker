import { TextAndImageSlice } from "@/types/slices";

export type Slice = {
  id: string;
  slice_type: string;
};

export type TextAndImageBundleSlice = {
  id: string;
  slice_type: "text_and_image_bundle";
  slices: TextAndImageSlice[];
};

export const bundleTextAndImageSlices = (slices: Slice[]): (Slice | TextAndImageBundleSlice)[] => {
  const result: (Slice | TextAndImageBundleSlice)[] = [];
  let currentBundle: TextAndImageSlice[] = [];

  slices.forEach((slice) => {
    if (slice.slice_type === "text_and_image") {
      currentBundle.push(slice as TextAndImageSlice);
    } else {
      if (currentBundle.length > 0) {
        result.push({
          id: `bundle-${currentBundle[0].id}`,
          slice_type: "text_and_image_bundle",
          slices: [...currentBundle],
        });
        currentBundle = [];
      }
      result.push(slice);
    }
  });

  if (currentBundle.length > 0) {
    result.push({
      id: `bundle-${currentBundle[0].id}`,
      slice_type: "text_and_image_bundle",
      slices: [...currentBundle],
    });
  }

  return result;
}; 