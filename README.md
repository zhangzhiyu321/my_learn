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
- Copy and paste selected points using the **Ctrl/Command+C** and **Ctrl/Command+V** shortcuts.
- Rotate selections by a custom angle.
- Sample a segment into evenly spaced points.
- Undo or redo changes at any time.
- Toggle the curve display on or off with the **Hide Line** button.
- Load a background image behind the axes for easier curve fitting. The image
  keeps its original aspect ratio.
- Drag the corner of the plot area to resize both width and height so the axes
  match your background image.
- The sidebar scrolls independently when controls exceed the viewport.
- Reset everything with the **Clear** button.

Simply open `index.html` in a modern browser to try it out. Point data is automatically saved to `localStorage` so you can resume where you left off.
