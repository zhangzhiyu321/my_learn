# my_learn

This project demonstrates a small web page that allows you to draw curves by selecting points. You can configure axis ranges, import or export `.dat` files and clear the plot. Points can be moved, deleted or rotated. Rectangle selection, segment sampling (now supporting multiple points) and a toggle for showing the curve are available. If no points are selected, the segment sampler uses all points. Basic undo/redo operations are supported. Use **Ctrl+C** and **Ctrl+V** to copy and paste selected points; the clipboard is used when possible and falls back to an internal buffer.

Reloading the page resets all points and settings as no data is stored between sessions.

Open `index.html` in a browser to try the demo. For details on advanced features and implementation notes see `CURVE_EDITOR_MANUAL.md`.

