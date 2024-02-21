function isSafeDomain(url, safeDomains) {
    const domaine = new URL(url).hostname;
    return safeDomains.some(safeDomain => domaine === new URL(`http://${safeDomain}`).hostname);
}

function calculerSimilarite(a, b) {
    const matrice = [];

    for (let i = 0; i <= b.length; i++) {
        matrice[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrice[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrice[i][j] = matrice[i - 1][j - 1];
            } else {
                matrice[i][j] = Math.min(
                    matrice[i - 1][j - 1] + 1,
                    matrice[i][j - 1] + 1,
                    matrice[i - 1][j] + 1
                );
            }
        }
    }

    const longueurMax = Math.max(a.length, b.length);
    const distance = matrice[b.length][a.length];
    const similarite = 1 - distance / longueurMax;

    return similarite;
}

function isSimilarUrlButNoIdentique(url, safeDomains) {
    const seuilDeSimilarite = 0.7;
    const domaineURL = new URL(url).hostname;

    for (const safeDomain of safeDomains) {
        const domaineSafe = new URL(`http://${safeDomain}`).hostname;
        if (calculerSimilarite(domaineURL, domaineSafe) > seuilDeSimilarite) {
            return domaineURL !== domaineSafe;
        }
    }

    return false;
}

const safeDomains = ["www.netflix.com", "www.google.com", "www.fnac.com", "www.darty.com"];
let urlsUniquesByOnglet = {};

browser.webNavigation.onCompleted.addListener((details) => {
    const currentURL = details.url;
    const tabId = details.tabId;

    // Réinitialise l'état si l'URL de l'onglet change
    if (!urlsUniquesByOnglet[tabId] || urlsUniquesByOnglet[tabId] !== currentURL) {
        urlsUniquesByOnglet[tabId] = currentURL;

        if (!isSafeDomain(currentURL, safeDomains) && isSimilarUrlButNoIdentique(currentURL, safeDomains)) {
            browser.windows.create({
                url: "alert.html",
                type: "popup",
                width: 350,
                height: 350
            });
        }
    }
});
