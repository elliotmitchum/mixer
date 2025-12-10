declare module "mixbox" {
  type RGBArray = [number, number, number] | [number, number, number, number];
  type RGBString = string;
  type RGBInput = RGBArray | RGBString;

  interface Mixbox {
    LATENT_SIZE: number;
    lerp(color1: RGBInput, color2: RGBInput, t: number): RGBArray | undefined;
    lerpFloat(color1: RGBInput, color2: RGBInput, t: number): number[] | undefined;
    lerpLinearFloat(color1: RGBInput, color2: RGBInput, t: number): number[] | undefined;
    rgbToLatent(r: RGBInput, g?: number, b?: number): number[] | undefined;
    latentToRgb(latent: number[]): RGBArray | undefined;
    floatRgbToLatent(r: RGBInput, g?: number, b?: number): number[] | undefined;
    latentToFloatRgb(latent: number[]): number[] | undefined;
    linearFloatRgbToLatent(r: RGBInput, g?: number, b?: number): number[] | undefined;
    latentToLinearFloatRgb(latent: number[]): number[] | undefined;
  }

  const mixbox: Mixbox;
  export default mixbox;
}


