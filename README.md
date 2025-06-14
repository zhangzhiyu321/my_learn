# my_learn

This repository includes a script to fetch the top trending projects on GitHub
for the current day and display their descriptions translated to Chinese. When
network access is unavailable, the script falls back to a built-in list of
example repositories so it can run without errors.

## Requirements

The script `github_trending.py` uses Python 3. It optionally depends on
`googletrans` for translation support. If this dependency or network access is
not available, the script outputs the built-in Chinese descriptions for the
offline list or the original English descriptions for live data.

Install dependencies (when network access is available):

```bash
pip install googletrans==4.0.0-rc1
```

## Usage

Run the script directly with Python:

```bash
python github_trending.py
```

The script will print the top ten trending repositories and their descriptions
in Chinese (or English if translation is not possible).

If the script cannot access GitHub, the built-in offline list will be used.
