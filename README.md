# plscompare

### <https://plscompare.com>

A site for making precise speedrun comparisons for games like Mario Kart World.

## Purpose

This tool is designed to facilitate the creation of comparison videos, which are commonly used in speedrunning communities to determine if a strategy is viable.

The UI allows for easy selection of starting and ending comparison frames, and then the compositing, freeze-frames and timer are all done automatically.

## Example

Here are two strategies for doing this section of the track *Shy Guy Bazaar*:

<div align=center>
  <img width="48%" alt="rails_example" src="https://github.com/user-attachments/assets/62f839ca-65ea-4b71-bb7e-9e3db9d18a1c" />
  <img width="48%" alt="ramps_example" src="https://github.com/user-attachments/assets/20af69a6-7450-4b00-bf5b-fdd68b60061a" />
</div>

<br>
If you're unfamiliar with MKWorld, it may be unclear which strategy is faster, and even if you do know, it's hard to tell what the time difference is. Using plscompare, you can make a comparison like this:

<img width="480" height="270" alt="comp_example" src="https://github.com/user-attachments/assets/e970c06e-bd19-498a-a874-e2b6512e4be5" />

It then becomes clear that the left strategy saves roughly 0.08 seconds (5ish frames).

(The actual comps are higher quality than this; I just had to turn it into a GIF to embed it into the README on all devices. See an actual example on the site landing page.)

## Stack

This application was coded using [Typescript](https://www.typescriptlang.org) and [React](https://react.dev/).

For the styling and design, I used [Tailwind](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/). I also used [Heropatterns](https://heropatterns.com/) and [Heroicons](https://heroicons.com/) for the patterns and SVGs seen throughout the site.

For the exporter (and also extracting frame timestamps for the frame selection), I used [Mediabunny](https://mediabunny.dev/). This library is a life saver for doing any client-side work in the browser; I'd recommend it to anyone.

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
