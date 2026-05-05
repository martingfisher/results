# RYCM Image and Video Asset Process

This site relies on visual proof, so assets need to feel polished without making pages slow. Use this process before adding new images or video to `public/assets`.

## Source and output folders

- Keep original source files outside the deploy folder.
- Put only optimised public files in `public/assets/projects`, `public/assets/video` or `public/assets/logos`.
- Use clear, lower-case filenames with hyphens, for example `insurance-for-hero-1440.webp`.
- Do not commit multi-hundred-megabyte source video files to `public/assets`.

## Image formats

- Use `webp` or `avif` for photos, case-study visuals and portfolio images.
- Use `svg` for logos, marks and simple icons.
- Use `jpg` only for photographic posters where it gives a smaller or more reliable result than WebP.
- Use `png` only when transparency is essential. If a PNG is photographic or above 400KB, make a WebP version.
- Convert all images to sRGB and strip unnecessary metadata before adding them to the site.

## Responsive image sizes

Create only the sizes the layout actually needs. Suggested output widths:

- Thumbnail/card: 480, 768, 960.
- Standard content image: 768, 1024, 1440.
- Full-width portfolio or case-study hero: 1024, 1440, 1920.
- Ultra-wide hero only when genuinely needed: 2560 maximum.

The smallest mobile image should still be at least 480px wide for sharpness on high-density screens. The largest public image should normally be no wider than 1920px unless it is a deliberate full-bleed hero.

## File-size targets

- Hero poster or full-width case-study image: target under 350KB, hard ceiling 500KB.
- Portfolio panels and proof-wall images: target under 250KB.
- Cards and thumbnails: target under 160KB.
- PNG exceptions: target under 400KB, otherwise convert or redesign.
- SVG logos: keep lean and remove editor metadata where possible.

Current audit note: most project WebP assets are already sensible. `public/assets/projects/packaged-martin.png` is about 2.2MB and should be converted/compressed before launch if it remains visible.

## Video rules

- Use short, muted background loops only where motion adds meaning.
- Keep hero loops around 12-18 seconds so the message animation can complete before repeating.
- Export MP4/H.264 for broad support, with a poster image fallback.
- Target hero background video at 10-18MB, with 20MB as the practical ceiling for launch.
- Target service/background loops at 3-8MB each.
- Keep original high-resolution source video outside the deployed public folder.

Current audit note: several legacy service videos in `public/assets/video` are hundreds of megabytes or more. They must be compressed or removed from deploy before launch.

## Layout requirements

- Every content image needs descriptive alt text unless it is purely decorative.
- Use `loading="lazy"` for non-hero images.
- Define stable dimensions with `aspect-ratio`, width constraints or fixed grid tracks so images do not cause layout shift.
- Use `object-fit: cover` for cropped visual panels and check that faces, products and key text are not awkwardly cropped on mobile.
- Use poster images and static fallbacks for videos.
- Respect `prefers-reduced-motion` by hiding background videos and showing the static fallback.

## Recommended next improvement

Astro can generate responsive image derivatives when images are imported through the build pipeline. The current site mostly references files from `public/assets`, which is simple but manual. Before launch, either:

- introduce a small `ResponsiveImage.astro` component and move key images into `src/assets` for generated `srcset` output; or
- keep the public-assets workflow, but generate named responsive derivatives manually and use `srcset`/`sizes` on hero, portfolio and case-study images.
