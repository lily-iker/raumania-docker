import { TextAndImageProps } from "./TextAndImage";

type TextAndImageSlice = {
    id: string;
    slice_type: "text_and_image";
    heading: string;
    body: string;
    imageUrl: string;
  };
  
  type Slice = TextAndImageSlice | { slice_type: string; [key: string]: any };
  
  export type TextAndImageBundle = {
    slice_type: "text_and_image_bundle";
    slices: TextAndImageProps[];
  };
  
  export type TextAndImageSliceOrBundle = TextAndImageProps | TextAndImageBundle;

export function bundleTextAndImageSlices(
  slices: TextAndImageProps[]
): TextAndImageSliceOrBundle[] {
  const res: TextAndImageSliceOrBundle[] = [];

  for (const slice of slices) {
    const last = res.at(-1);

    // Gộp nếu trước đó là một bundle
    if (last && "slice_type" in last && last.slice_type === "text_and_image_bundle") {
      last.slices.push(slice);
    } else {
      res.push({
        slice_type: "text_and_image_bundle",
        slices: [slice],
      });
    }
  }

  return res;
}
  