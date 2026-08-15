# plscompare

### Site: <https://plscompare.com>

A site for making precise speedrun comparisons for games like Mario Kart World.

## Purpose

This tool is designed to facilitate the creation of comparison videos, which are commonly used in speedrunning communities to determine if a strategy is viable.

The UI allows for easy selection of starting and ending comparison frames. Once that is completed, the compositing, freeze-frames and timer are all done automatically.

Plscompare is designed around being easy to use and fast. It's comptible with both mobile and desktop browsers, and on average, making & exporting a comparison takes less than 2 minutes.

## Example

Here's an example of what a comparison made on the site looks like:

https://github.com/user-attachments/assets/af2034a3-f56e-4c28-bbc9-930a637067b4

There are also a few different layout formats for comparisons. For example, you could choose to make each video fullscreen instead of cropped towards the middle, or stack the videos vertically rather than horizontally.

## Stack

### Frontend

The frontend code is written with [TypeScript](https://www.typescriptlang.org) and [React](https://react.dev/).

For the styling and design, I used [Tailwind](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/). I also used [Heropatterns](https://heropatterns.com/) and [Heroicons](https://heroicons.com/) for the patterns and SVGs seen throughout the site.

The video exporting is primarily done on the backend. However, there is still some client-side video work, like trimming the videos before they're sent to the server. For such tasks, I used [Mediabunny](https://mediabunny.dev/).

The site is deployed as a [Cloudflare Worker](https://www.cloudflare.com/products/workers/).

### Backend

The original version of the site did exporting fully client-side. However, there were too many issues and inconsistencies, especially for mobile users.

The backend is a [Node](https://nodejs.org/en) server, where I used [Express](https://expressjs.com/) to create a REST API for communication with the frontend. It also written in TypeScript.

The actual video processing and rendering pipeline uses [FFmpeg](https://www.ffmpeg.org/).

The backend is deployed on [Railway](https://railway.com).

## Development

To run locally, all you have to do is:

```bash
git clone https://github.com/demibabs/plscompare
cd plscompare
npm install
npm run dev
```

And that will run both the frontend and backend. By default, the frontend will be on <http://localhost:5173> and the backend will be on <http://localhost:3000>.

If you export, uploaded and downloaded videos will be saved to ```/tmp (or whatever your computer's temporary directory is called) /plscompare/jobs```. The videos associated with a particular export will clear after an hour and the entire folder will be deleted and re-initialized on server restart.

I don't expect contributions as this is more of a personal project. But if you'd like to contribute, I'm totally open to it!
