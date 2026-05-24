# AI-oplæser WebApp

En enkel webapp til iPhone/iPad og computer.

## Funktioner

- Læser tekst op på dansk
- Læser én linje ad gangen ved linjeskift
- Stavekontrol i tekstfeltet via browser/iOS
- Simpel stavehjælp uden AI med kendte rettelser
- Valg mellem kvindelig og mandlig stemme, hvis enheden har stemmerne installeret
- Kan lægges på GitHub Pages

## Sådan bruges den lokalt på Mac

Åbn `index.html` i en browser.

Nogle PWA-funktioner virker først korrekt, når siden ligger online, fx via GitHub Pages.

## Upload til GitHub Pages

1. Opret et nyt repository på GitHub.
2. Upload alle filerne i denne mappe.
3. Gå til `Settings` → `Pages`.
4. Vælg branch `main` og folder `/root`.
5. Åbn linket fra GitHub Pages på iPhone/iPad i Safari.
6. Tryk `Del` → `Føj til hjemmeskærm`.

## Stavehjælp

Den indbyggede browser-stavekontrol er slået til med:

```html
spellcheck="true" lang="da"
```

De simple rettelser ligger i `app.js` i objektet `spellingCorrections`.
Udvid listen dér, hvis der skal være samme ordliste som i version 0.5.


## Ny funktion

Når brugeren trykker Enter i tekstfeltet, læser appen automatisk den linje op, der netop er skrevet. Shift+Enter laver linjeskift uden automatisk oplæsning.
