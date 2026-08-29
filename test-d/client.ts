import type { OptimizedImageData } from "../src/types";
import hero from "./hero.jpg?vite-image";

hero satisfies OptimizedImageData;

const width: number = hero.width;

// @ts-expect-error width is numeric metadata, never a CSS string.
const invalidWidth: string = hero.width;

void width;
void invalidWidth;
