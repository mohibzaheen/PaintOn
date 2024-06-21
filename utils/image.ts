import * as jpeg from "jpeg-js";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
global.Buffer = Buffer;

/**
 *
 * @param path The path to the image file
 */
export const getPixelMatrix = async (path: string) => {
  try {
    // NEED TO OPTIMIZE THE IMAGE SIZE
    const imageData = await FileSystem.readAsStringAsync(path, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const rawImageData = Buffer.from(imageData, "base64");

    // Decode the JPEG image to get pixel data
    const decodedImage = jpeg.decode(rawImageData, {
      useTArray: true,
      formatAsRGBA: true,
    });

    console.log("Step 4");
    console.log("---- Printing decoded image data ----");
    console.log({
      width: decodedImage.width,
      height: decodedImage.height,
      data: decodedImage.data,
    });
    console.log("---- End of decoded image data ----");

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
