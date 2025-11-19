# Dr Ecco Website

This is the source code for the Dr Ecco Omniheurist website for hosting final projects for *Heuristic Problem Solving* at NYU.

The GitHub repo is currently hosted at [https://github.com/wjmn/drecco](https://github.com/wjmn/drecco). 

**NOTE**: none of the actual games are stored in this repository (except for a single example game, Gomoku). Games must be added into the `content/games` folder (see Adding Games below) and the site must then be rebuilt (see Development below - it's just one command). 

# Development

This version of the Dr Ecco website is a static site generated with [Zola](https://www.getzola.org/). 

First, install Zola (either via your package manager, or download the [prebuilt binaries available on GitHub](https://github.com/getzola/zola/releases)).

Then clone this repo:

```
git clone https://github.com/wjmn/drecco
```

Add your games into `content/games` under a subdirectory for each year (and ensure each subdirectory has a `_index.md` file - see Adding Games below). 

To run the live development server:

```
zola serve
```

# Deployment

Using CIMS Web Hosting, You can deploy either to your own personal web page (this is useful for drafting while everyone is developing their games, so they can see how it will look on the website), or to the Dr Ecco website for the course.

## Deploying to Personal Web Page

First, make sure you have installed Zola locally (either via your package manager, or download the [prebuilt binaries available on GitHub](https://github.com/getzola/zola/releases)).

To build/rebuild for deployment using CIMS Web Hosting, run the `build.sh` script (you can do this locally), passing it the base URL that your site will be hosted on, e.g.:

```
./build.sh "https://cims.nyu.edu/~myusername/drecco"
```

This will produce a `drecco-release.zip` zip file in this directory. This zip file contains a folder called `drecco`. Copy the zip file to the web server, unzip it, then place the `drecco` folder into your web hosting directory (e.g. as `/web/myusername/drecco`). You may also have to give it the correct permissions for the web server to access it (e.g. `chmod -R 755 drecco`). Your website should now be up and running (e.g. on `https://cims.nyu.edu/~myusername/drecco`). You can also see the [NYU CIMS instructions for web hosting for some background information on this](https://cims.nyu.edu/dynamic/systems/userservices/webhosting/).

## Deploying to Website for Course


Again, first, make sure you have installed Zola locally (either via your package manager, or download the [prebuilt binaries available on GitHub](https://github.com/getzola/zola/releases)).

To build/rebuild for deployment using CIMS Web Hosting, run the `build.sh` script (you can do this locally, you don't have to do this on the server), passing it the base URL for the course website (which is currently https://cs.nyu.edu/~shasha/drecco):

```
./build.sh "https://cs.nyu.edu/~shasha/drecco"
```

This produces a `drecco-release.zip` zip file in this directory, which contains a folder called `drecco`. You will need to copy the contents of the `drecco` folder to the folder for the course Dr Ecco website.

The current Dr Ecco website for the course is located in Prof Shasha's homepage directory `/web/shasha/` as `/web/shasha/drecco`. Replace the current `drecco` folder in that directory with the new `drecco` folder to update the website (you might want to back it up beforehand!). You will probably need to update the permissions recursively too for all files in this directory so the server can access them (`chmod -R 755 ./*` inside the `drecco` directory.)



# Adding Games

First, create a subdirectory for the year if it doesn't already exist under `content/games` (e.g. `content/games/2024/`). 

Then add a file `_index.md` inside that directory (e.g. `content/games/2024/_index.md`) which must contain the following content (using 2024 as an example):

```md
+++
title = "2024"
weight = 2024
sort_by = "title"
+++
```

This defines variables for showing the year's games on the homepage. The weight is necessary for it to be sorted properly. Note there are no quotation marks around the weight.

You can then add games as subdirectories inside that year (e.g. `content/games/2024/MyGame/`). Each game directory **must** contain the following files as a minimum:

1. `index.md`: a Markdown file introducing and describing the rules of the game (which gets shown on the description page for the game) which **must** have specific frontmatter variables defined (see below).
2. `iframe.html`: the actual game, bundled as a single self-contained static HTML file (if you open the HTML file, it should start the game!)
3. `thumbnail.png`: a thumbnail of the game, shown on the homepage at about 100px width.

If you don't have all these files for each game, then the site won't build.

The `index.md` markdown file **must** have the following frontmatter variables defined at the start of it:

```md
+++
title="My Game Title"

[extra]
team="My Team Name"
thumbnail="thumbnail.png"
+++
```

If these variables aren't present for a game, then the site won't build. 

It's probably easiest to see an example: see an example of a built game added to this website in `content/games/2023/Gomoku` (notice also the  `_index.md` file present in the `content/games/2023` folder). The source code used to build this game is available at [https://github.com/wjmn/gomoku](https://github.com/wjmn/gomoku). There is also a [blank Elm game template](https://github.com/wjmn/drecco-game-template) on which this game is based, which provides a template to help streamline defining settings and the build process. You don't have to use this Elm template though - as long as your game produces a single HTML file (`iframe.html`) which runs the game when opened, then that will work too (e.g. if you code it manually using JavaScript & jQuery, or if you use React or Vue or some other web framework, or any other language which compiles to JavaScript). Please include all resources you need in your game folder, to help ensure links don't get broken. 

Once you've added your games, rebuild the site for deployment (or it will update automatically if you're running the live development server). 

# Other Notes

1. Use the extension `.markdown` for any extra markdown files included with the game (e.g. a README). `index.md` should be the only file with the extension `.md` in a game's directory. This is because Zola treats any `.md` files as pages to be rendered in the website (when we only really want the `index.md` file rendered).

