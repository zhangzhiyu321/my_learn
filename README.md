# my_learn

This project demonstrates a small web page that allows you to draw curves by selecting points. You can configure axis ranges, import or export `.dat` files and clear the plot. Points can be moved, deleted or rotated. Shift-drag anywhere on the plot to draw a rectangle and select points, and dragging a selected point moves the entire selection. Segment sampling supports multiple points and there is a toggle for showing the curve. If no points are selected, the segment sampler uses all points. Basic undo/redo operations are supported. Use **Ctrl+C**/**Command+C** and **Ctrl+V**/**Command+V** to copy and paste selected points. When the browser blocks clipboard access (such as when opening from disk), data is stored in an internal buffer so pasting still works inside the page.

Reloading the page resets all points and settings as no data is stored between sessions.

Open `index.html` in a browser to try the demo. For details on advanced features and implementation notes see `CURVE_EDITOR_MANUAL.md`.

