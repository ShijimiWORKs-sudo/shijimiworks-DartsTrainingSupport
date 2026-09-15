"""Streamlit Cloud entry point for Darts Training Support.

This app is a React (Vite) single-page app, not a Streamlit-native app.
Streamlit Cloud only runs Python, so this file does not reimplement the UI —
it embeds the already-built, fully self-contained HTML bundle
(`static/embed.html`) inside the page as a real iframe `src=` (NOT
`srcdoc`).

Why `src=` and not `st.components.v1.html()` (which uses `srcdoc`): the app
uses react-router, and react-router resolves URLs against
`window.location.href`. Inside a `srcdoc` iframe that href is permanently
the literal string "about:srcdoc" — a non-hierarchical URL that
react-router cannot use as a base, which throws and crashes the whole app
before it renders anything. Loading the SAME html file as a normal
same-origin GET request (via Streamlit's static file serving, enabled in
.streamlit/config.toml) gives the page a real, valid URL instead, and
react-router works exactly as it does standalone.

IMPORTANT: `static/embed.html` is a build artifact, not hand-written.
Whenever the app in `src/` changes, regenerate it before deploying:

    npm run build:embed

and commit the updated `static/embed.html`. Streamlit Cloud does not run
npm/vite for you — it only installs `requirements.txt` and runs this file.
"""

import pathlib

import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="Darts Training Support",
    page_icon="🎯",
    layout="wide",
)

# The React app already provides its own full page (header/nav/cards/etc).
# Hide Streamlit's own chrome and padding so the embedded app reads as a
# real, standalone page rather than a widget on a Streamlit page.
st.markdown(
    """
    <style>
      #MainMenu, header[data-testid="stHeader"], footer {visibility: hidden; height: 0;}
      .block-container {padding: 0 !important; margin: 0 !important; max-width: 100% !important;}
      iframe {border: none; display: block;}
    </style>
    """,
    unsafe_allow_html=True,
)

EMBED_HTML_PATH = pathlib.Path(__file__).parent / "static" / "embed.html"
# Path Streamlit's built-in static-file server exposes files under `static/`
# at (relative to the app root). Requires `enableStaticServing = true` in
# .streamlit/config.toml — already set.
EMBED_HTML_SRC = "app/static/embed.html"

# Adjust to taste: this is a fixed pixel height for the embedded iframe.
# The app itself is fully responsive inside that box (desktop sidebar /
# mobile bottom nav), and will show its own scrollbar if content is taller
# than this value (scrolling=True below).
EMBED_HEIGHT_PX = 1100

if not EMBED_HTML_PATH.exists():
    st.error(
        "static/embed.html が見つかりません。デプロイ前に `npm run build:embed` を実行し、"
        "生成された static/embed.html をコミットしてください。"
    )
else:
    components.iframe(EMBED_HTML_SRC, height=EMBED_HEIGHT_PX, scrolling=True)
