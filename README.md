# Curve Editor Demo

This repository contains a lightweight curve editor built with D3.js. It lets you interactively create and adjust a set of points and export them in a simple `.dat` format.

## Features

- Set custom axis ranges.
- Click the plot to add points and drag them to new positions.
- Hold **Shift** and drag to draw a selection rectangle for multiple points.
- Use the **Delete** key to remove selected points.
- Nudge selected points with the arrow keys (hold **Shift** for larger steps) without scrolling the page.
- Click empty space to clear the current selection.
- Import or export point data as a `.dat` file.
- Reset everything with the **Clear** button.

Simply open `index.html` in a modern browser to try it out. All data is kept only in memory, so reloading the page will discard any changes.
