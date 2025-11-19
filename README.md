# Make a game

## Setup
The website is built using Zola, so you should install Zola to test your game.
You can install it either via your package manager, or download the [prebuilt binaries available on GitHub](https://github.com/getzola/zola/releases).

e.g. `brew install zola`.

Then, clone the repo. The repo includes a sample game so that you can see what it looks like on the website.

To test your game locally, run `zola serve`.


## Add your game

Make a new folder for your game under the 2025 directory (e.g. `content/games/2025/my-game`).
Each game directory **must** contain the following files as a minimum:

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

It's probably easiest to see an example: see an example of a built game added to this website in `content/games/2025/Gomoku` (notice also the  `_index.md` file present in the `content/games/2025` folder). The source code used to build this game is available at [https://github.com/wjmn/gomoku](https://github.com/wjmn/gomoku). There is also a [blank Elm game template](https://github.com/wjmn/drecco-game-template) on which this game is based, which provides a template to help streamline defining settings and the build process. You don't have to use this Elm template though - as long as your game produces a single HTML file (`iframe.html`) which runs the game when opened, then that will work too (e.g. if you code it manually using JavaScript & jQuery, or if you use React or Vue or some other web framework, or any other language which compiles to JavaScript). Please include all resources you need in your game folder, to help ensure links don't get broken.

# Other Notes

1. Use the extension `.markdown` for any extra markdown files included with the game (e.g. a README). `index.md` should be the only file with the extension `.md` in a game's directory. This is because Zola treats any `.md` files as pages to be rendered in the website (when we only really want the `index.md` file rendered).

