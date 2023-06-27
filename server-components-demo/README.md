# React Server Components Demo

* [What is this?](#what-is-this)
* [When will I be able to use this?](#when-will-i-be-able-to-use-this)
* [Should I use this demo for benchmarks?](#should-i-use-this-demo-for-benchmarks)
* [Setup](#setup)
* [DB Setup](#db-setup)
  + [Step 1. Create the Database](#step-1-create-the-database)
  + [Step 2. Connect to the Database](#step-2-connect-to-the-database)
  + [Step 3. Run the seed script](#step-3-run-the-seed-script)
* [Notes about this app](#notes-about-this-app)
  + [Interesting things to try](#interesting-things-to-try)
* [Built by (A-Z)](#built-by-a-z)
* [Code of Conduct](#code-of-conduct)
* [License](#license)

## What is this?

This is a demo app built with Server Components, an experimental React feature. **We strongly recommend [watching our talk introducing Server Components](https://reactjs.org/server-components) before exploring this demo.** The talk includes a walkthrough of the demo code and highlights key points of how Server Components work and what features they provide.

**Update (March 2023):** This demo has been updated to match the [latest conventions](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components).

## When will I be able to use this?

Server Components are an experimental feature and **are not ready for adoption**. For now, we recommend experimenting with Server Components via this demo app. **Use this in your projects at your own risk.**

## Should I use this demo for benchmarks?

If you use this demo to compare React Server Components to the framework of your choice, keep this in mind:

* **This demo doesn’t have server rendering.** Server Components are a separate (but complementary) technology from Server Rendering (SSR). Server Components let you run some of your components purely on the server. SSR, on the other hand, lets you generate HTML before any JavaScript loads. This demo *only* shows Server Components, and not SSR. Because it doesn't have SSR, the initial page load in this demo has a client-server network waterfall, and **will be much slower than any SSR framework**. However, Server Components are meant to be integrated together with SSR, and they *will* be in a future release.
* **This demo doesn’t have an efficient bundling strategy.** When you use Server Components, a bundler plugin will automatically split the client JS bundle. However, the way it's currently being split is not necessarily optimal. We are investigating more efficient ways to split the bundles, but they are out of scope of this demo.
* **This demo doesn’t have partial refetching.** Currently, when you click on different “notes”, the entire app shell is refetched from the server. However, that’s not ideal: for example, it’s unnecessary to refetch the sidebar content if all that changed is the inner content of the right pane. Partial refetching is an [open area of research](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md#open-areas-of-research) and we don’t yet know how exactly it will work.

This demo is provided “as is” to show the parts that are ready for experimentation. It is not intended to reflect the performance characteristics of a real app driven by a future stable release of Server Components.

## Setup

You will need to have [Node 18 LTS](https://nodejs.org/en) in order to run this demo. (If you use `nvm`, run `nvm i` before running `npm install` to install the recommended Node version.)

  ```
  npm install --legacy-peer-deps
  npm start
  ```

(Or `npm run start:prod` for a production build.)

Then open http://localhost:4000.

## DB Setup

LOL JK

## Notes about this app

The demo is a note-taking app called **React Notes**. It consists of a few major parts:

- It uses a Webpack plugin (not defined in this repo) that allows us to only include client components in build artifacts
- An Express server that:
  - Serves API endpoints used in the app
  - Renders Server Components into a special format that we can read on the client
- A React app containing Server and Client components used to build React Notes

This demo is built on top of our Webpack plugin, but this is not how we envision using Server Components when they are stable. They are intended to be used in a framework that supports server rendering — for example, in Next.js. This is an early demo -- the real integration will be developed in the coming months. Learn more in the [announcement post](https://reactjs.org/server-components).

### Interesting things to try

- Expand note(s) by hovering over the note in the sidebar, and clicking the expand/collapse toggle. Next, create or delete a note. What happens to the expanded notes?
- Change a note's title while editing, and notice how editing an existing item animates in the sidebar. What happens if you edit a note in the middle of the list?
- Search for any title. With the search text still in the search input, create a new note with a title matching the search text. What happens?
- Search while on Slow 3G, observe the inline loading indicator.
- Switch between two notes back and forth. Observe we don't send new responses next time we switch them again.
- Uncomment the `await fetch('http://localhost:4000/sleep/....')` call in `Note.js` or `NoteList.js` to introduce an artificial delay and trigger Suspense.
  - If you only uncomment it in `Note.js`, you'll see the fallback every time you open a note.
  - If you only uncomment it in `NoteList.js`, you'll see the list fallback on first page load.
  - If you uncomment it in both, it won't be very interesting because we have nothing new to show until they both respond.
- Add a new Server Component and place it above the search bar in `App.js`. Import `db` from `db.js` and use `await db.query()` from it to get the number of notes. Oberserve what happens when you add or delete a note.

You can watch a [recorded walkthrough of all these demo points here](https://youtu.be/La4agIEgoNg?t=600) with timestamps. (**Note:** this recording is slightly outdated because the repository has been updated to match the [latest conventions](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components).)

## Built by (A-Z)

- [Andrew Clark](https://twitter.com/acdlite)
- [Dan Abramov](https://twitter.com/dan_abramov)
- [Joe Savona](https://twitter.com/en_JS)
- [Lauren Tan](https://twitter.com/sugarpirate_)
- [Sebastian Markbåge](https://twitter.com/sebmarkbage)
- [Tate Strickland](http://www.tatestrickland.com/) (Design)

## [Code of Conduct](https://engineering.fb.com/codeofconduct/)
Facebook has adopted a Code of Conduct that we expect project participants to adhere to. Please read the [full text](https://engineering.fb.com/codeofconduct/) so that you can understand what actions will and will not be tolerated.

## License
This demo is MIT licensed.
