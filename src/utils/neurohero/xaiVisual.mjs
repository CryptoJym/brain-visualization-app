import {compileImagePrompt} from './portraitBrief.mjs';
export const XAI_STYLE_VERSION='cc-xai-anime-1.0';
// Public visual rules only. Both the confirmation panel and server use this compiler.
export function compileXaiPortraitPrompt(profile,choices){return compileImagePrompt(profile,choices)+' Clearly hand-drawn 2D anime illustration: clean contour lines, cel-shaded materials, expressive anime eyes and richly painted backgrounds. Not a photograph, CGI, 3D render or photorealistic face. Original character, clearly adult, fully clothed, nonsexual, no real-person likeness. Make the character expressive and relatable rather than idealized. Preserve space around the head and hands; no written words or infographic panels.';}
