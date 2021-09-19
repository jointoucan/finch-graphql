(async function main() {
  await browser.devtools.panels.create(
    'Finch GraphiQL',
    'images/toucan.png',
    'pages/devtoolsPanel.html',
  );
})();
