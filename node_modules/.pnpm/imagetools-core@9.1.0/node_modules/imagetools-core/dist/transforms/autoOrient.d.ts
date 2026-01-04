import type { TransformFactory } from '../types.js';
export interface autoOrientOptions {
    noAutoOrient: '' | 'true' | 'false';
}
export declare const autoOrient: TransformFactory<autoOrientOptions>;
