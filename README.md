# plscompare

### <https://plscompare.com>

A site for making precise speedrun comparisons for games like Mario Kart World.

## Purpose

This tool is designed to facilitate the creation of comparison videos, which are commonly used in speedrunning communities to determine if a strategy is viable.

The UI allows for easy selection of starting and ending comparison frames, and then the compositing, freeze-frames and timer are all done automatically.

## Example

Here are two strategies for doing this section of the track *Shy Guy Bazaar*:

<div style="display: flex; gap: 20px; justify-content: center;">
  <video width="40%" controls>
    <source src="./docs/readme_media/rails_example.mov">
  </video>
  <video width="40%" controls>
    <source src="./docs/readme_media/ramps_example.mov">
  </video>
</div>  
<br>
If you're unfamiliar with MKWorld, it may be unclear which strategy is faster, and even if you do know, it's hard to tell what the time difference is. Using **plscompare**, you can make a comp like this:

<div style="display: flex; justify-content: center; margin-top: 20px">
  <video width="70%" controls>
    <source src="./docs/readme_media/comp_example.mp4"></source>
  </video>
</div>
<br>
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
