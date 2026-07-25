# plscompare

### <https://plscompare.com>

A site for making precise speedrun comparisons for games like Mario Kart World.

## Purpose

This tool is designed to facilitate the creation of comparison videos, which are commonly used in speedrunning communities to determine if a strategy is viable.

The UI allows for easy selection of starting and ending comparison frames, and then the compositing, freeze-frames and timer are all done automatically.

## Example

Here are two strategies for doing this section of the track *Shy Guy Bazaar*:

https://github.com/user-attachments/assets/60b29d5d-6397-46e2-8930-19f8d7c63b3e

https://github.com/user-attachments/assets/de5b6f35-4c65-48a2-a073-cbbef186d40a

If you're unfamiliar with MKWorld, it may be unclear which strategy is faster, and even if you do know, it's hard to tell what the time difference is. Using **plscompare**, you can make a comp like this:

https://github.com/user-attachments/assets/1ba2d9f1-e906-4716-86ec-2706e6c962a5

It then becomes clear that the left strategy saves roughly 0.08 seconds (5ish frames).

## Stack

This application was coded using [Typescript](https://www.typescriptlang.org) and [React](https://react.dev/).

For the styling and design, I used [Tailwind](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/). I also used [Heropatterns](https://heropatterns.com/) and [Heroicons](https://heroicons.com/) for the patterns and SVGs seen throughout the site.

For the exporter (and also extracting frame timestamps for the frame selection), I used [Mediabunny](https://mediabunny.dev/). This library is a life saver for doing any client-side work in the browser; I'd recommend it to anyone.

However, the exporting is currently quite slow on mobile and low-end devices. Thus I am heavily considering moving it server-side and either using a headless browser or rewriting the exporter with FFmpeg.

The site is deployed on [Cloudflare Pages](https://pages.cloudflare.com/).

## Development

For now, the site is entirely local, with no backend. Thus to run locally, all you have to do is:

```bash
git clone https://github.com/demibabs/plscompare
cd plscompare
npm install
npm run dev
```

And you should be good to go!
