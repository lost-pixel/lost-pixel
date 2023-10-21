
// this is an action that loads utterances comments when the element is in view
// so as not to incur the JS cost upfront if the person never scrolls down to the comments

// https://svelte.dev/repl/c6a402704224403f96a3db56c2f48dfc?version=3.55.1

import { GH_USER_REPO } from "$lib/siteConfig";

/** @type any */
let intersectionObserver;

let hasLoaded = false

export function injectScript(element, number) {
  // have to do this because direct injection using @html doesnt work
  // adapted from https://github.com/utterance/utterances/issues/161#issuecomment-550991248
  const scriptElem = document.createElement("script");
  scriptElem.src = "https://utteranc.es/client.js";
  scriptElem.async = true;
  scriptElem.crossOrigin = "anonymous";
  scriptElem.setAttribute("repo", GH_USER_REPO);
  scriptElem.setAttribute("issue-number", number);
  // scriptElem.setAttribute("label", "blog-comment");
  const theme = document.documentElement.classList.contains('dark') ? 'icy-dark' : 'github-light';
  scriptElem.setAttribute("theme", theme);

  // replace all contents of element and append script
  element.innerHTML = "";
  element.appendChild(scriptElem);
}

export default function viewport(element, { number }) {

  function ensureIntersectionObserver() {
    if (intersectionObserver) return;

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!hasLoaded && entry.isIntersecting) {
            injectScript(element, number);
            hasLoaded = true
          }
        });
      }
    );
  }
  ensureIntersectionObserver();

  intersectionObserver.observe(element);

  return {
    destroy() {
      hasLoaded = false
      intersectionObserver.unobserve(element);
    }
  }
}