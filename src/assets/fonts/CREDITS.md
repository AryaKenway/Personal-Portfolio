# Font asset credits

| File | Asset | Creator | Source | License |
| --- | --- | --- | --- | --- |
| `eb-garamond-msdf.json`, `eb-garamond-msdf.png` | EB Garamond (variable, default instance), printable ASCII as an MSDF atlas | Georg Duffner & Octavio Pardo | https://github.com/google/fonts/tree/main/ofl/ebgaramond | [SIL Open Font License 1.1](https://openfontlicense.org) (see `OFL.txt`) |

The atlas was generated from `EBGaramond[wght].ttf` with `npx msdf-bmfont-xml@2.7.0 -f json -s 64 -r 8 -m 512,512 -i charset.txt`, where `charset.txt` holds ASCII 32-126. It is drawn by `src/components/MsdfName.jsx` with OGL's `Text`. Regenerate it the same way if the name ever needs characters outside ASCII.
