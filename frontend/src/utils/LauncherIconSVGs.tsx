const svgElement1 = `<svg 
    focusable="false" 
    stroke="currentColor" 
    fill="none" 
    stroke-width="2" 
    viewBox="0 0 24 24"
    stroke-linecap="round" 
    stroke-linejoin="round" 
    height="1em" 
    width="1em" 
    xmlns="http://www.w3.org/2000/svg"
    style=" width: 38px; height: 38px;">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path
        d="M5.821 4.91c3.898 -2.765 9.469 -2.539 13.073 .536c3.667 3.127 4.168 8.238 1.152 11.897c-2.842 3.447 -7.965 4.583 -12.231 2.805l-.232 -.101l-4.375 .931l-.075 .013l-.11 .009l-.113 -.004l-.044 -.005l-.11 -.02l-.105 -.034l-.1 -.044l-.076 -.042l-.108 -.077l-.081 -.074l-.073 -.083l-.053 -.075l-.065 -.115l-.042 -.106l-.031 -.113l-.013 -.075l-.009 -.11l.004 -.113l.005 -.044l.02 -.11l.022 -.072l1.15 -3.451l-.022 -.036c-2.21 -3.747 -1.209 -8.392 2.411 -11.118l.23 -.168z"
        stroke-width="0" fill="currentColor"></path>
  </svg>`

const svgElement2 = `<svg
    focusable="false"
    stroke="currentColor"
    fill="none"
    stroke-width="2"
    viewBox="0 0 16 16"
    stroke-linecap="round" 
    stroke-linejoin="round"
    height="1.3em"
    width="1.3em"
    xmlns="http://www.w3.org/2000/svg"
    style=" width: 30px; height: 30px;">
    <path d="M2 0a2 2 0 00-2 2v12.793a.5.5 0 00.854.353l2.853-2.853A1 1 0 014.414 12H14a2 2 0 002-2V2a2 2 0 00-2-2H2z"
        stroke-width="0" fill="currentColor" />
    </svg>`

const svgElement3 = `<svg
    focusable="false"
    stroke="currentColor"
    fill="none"
    stroke-width="2"
    viewBox="0 0 16 16"
    stroke-linecap="round" 
    stroke-linejoin="round"
    height="1.3em"
    width="1.3em"
    xmlns="http://www.w3.org/2000/svg"
    style=" width: 30px; height: 30px;">
    <path d="M14 0a2 2 0 012 2v12.793a.5.5 0 01-.854.353l-2.853-2.853a1 1 0 00-.707-.293H2a2 2 0 01-2-2V2a2 2 0 012-2h12z"
        stroke-width="0" fill="currentColor" />
    </svg>`

const svgElement4 = `<svg
    focusable="false"
    stroke="currentColor"
    fill="none"
    stroke-width="2"
    viewBox="0 0 16 16"
    stroke-linecap="round" 
    stroke-linejoin="round"
    height="1.3em"
    width="1.3em"
    xmlns="http://www.w3.org/2000/svg"
    style=" width: 32px; height: 32px;">
    <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 01-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 10-2 0 1 1 0 002 0zm4 0a1 1 0 10-2 0 1 1 0 002 0zm3 1a1 1 0 100-2 1 1 0 000 2z"
        stroke-width="0" fill="currentColor" />
    </svg>`

const svgElement5 = `<svg
    focusable="false"
    stroke="currentColor"
    fill="none"
    stroke-width="2"
    viewBox="0 0 24 24"
    stroke-linecap="round" 
    stroke-linejoin="round"
    height="1.3em"
    width="1.3em"
    xmlns="http://www.w3.org/2000/svg"
    style=" width: 32px; height: 32px;">
    <path d="M11.999 0c-2.25 0-4.5.06-6.6.21a5.57 5.57 0 00-5.19 5.1c-.24 3.21-.27 6.39-.06 9.6a5.644 5.644 0 005.7 5.19h3.15v-3.9h-3.15c-.93.03-1.74-.63-1.83-1.56-.18-3-.15-6 .06-9 .06-.84.72-1.47 1.56-1.53 2.04-.15 4.2-.21 6.36-.21s4.32.09 6.36.18c.81.06 1.5.69 1.56 1.53.24 3 .24 6 .06 9-.12.93-.9 1.62-1.83 1.59h-3.15l-6 3.9V24l6-3.9h3.15c2.97.03 5.46-2.25 5.7-5.19.21-3.18.18-6.39-.03-9.57a5.57 5.57 0 00-5.19-5.1c-2.13-.18-4.38-.24-6.63-.24zm-5.04 8.76c-.36 0-.66.3-.66.66v2.34c0 .33.18.63.48.78 1.62.78 3.42 1.2 5.22 1.26 1.8-.06 3.6-.48 5.22-1.26.3-.15.48-.45.48-.78V9.42c0-.09-.03-.15-.09-.21a.648.648 0 00-.87-.36c-1.5.66-3.12 1.02-4.77 1.05-1.65-.03-3.27-.42-4.77-1.08a.566.566 0 00-.24-.06z"
        stroke-width="0" fill="currentColor" />
    </svg>`

export const LauncherIconsSVGs: Map<string, string> = new Map([
    ['icon1', svgElement1],
    ['icon2', svgElement2],
    ['icon3', svgElement3],
    ['icon4', svgElement4],
    ['icon5', svgElement5],
]);