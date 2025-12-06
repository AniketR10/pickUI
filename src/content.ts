console.log("!!! BANDIT CONTENT SCRIPT LOADED !!!");

let isInspecting = false;
let currentElement: HTMLElement | null = null;
let overlayContainer: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let hudButton: HTMLElement | null = null;
let selectionTimeout: any = null; // 1. NEW: Timer variable

const wantedProps = [
  "color", "background-color", "background-image", "font-size", "font-family",
  "font-weight", "line-height", "padding", "padding-top", "padding-bottom", "padding-left", "padding-right",
  "margin", "margin-top", "margin-bottom", "margin-left", "margin-right",
  "border", "border-radius", "border-width", "border-color", "border-style",
  "display", "flex-direction", "justify-content", "align-items", "gap",
  "box-shadow", "width", "height", "position", "z-index", "cursor", "text-align",
  "top", "left", "right", "bottom", "max-width", "max-height", "min-width", "min-height"
];

function createOverlay() {
  if (overlayContainer) return;
  overlayContainer = document.createElement('div');
  overlayContainer.id = 'bandit-overlay-container';
  Object.assign(overlayContainer.style, {
    position: 'fixed', zIndex: '2147483647', pointerEvents: 'none', top: '0', left: '0', width: '0', height: '0'
  });
  document.body.appendChild(overlayContainer);
  shadowRoot = overlayContainer.attachShadow({ mode: 'open' });
  const button = document.createElement('button');
  button.innerText = '✚ Get HTML';
  Object.assign(button.style, {
    position: 'fixed', display: 'none', background: '#2563eb', color: 'white',
    border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
    fontFamily: 'sans-serif', fontWeight: 'bold', cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', pointerEvents: 'auto',
    transition: 'all 0.1s ease', zIndex: '2147483647',
    
    // 2. NEW: The Invisible Bridge
    // This makes the button "taller" invisibly so your mouse doesn't fall into the gap
    borderBottom: '10px solid transparent', 
    backgroundClip: 'padding-box',
    transform: 'translateY(-10px)' // Pull it closer to the element
  });

  // 3. NEW: Keep selection if hovering the button itself
  button.addEventListener('mouseenter', () => {
    if (selectionTimeout) clearTimeout(selectionTimeout);
  });

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    captureCurrentElement();
  });
  shadowRoot.appendChild(button);
  hudButton = button;
}

function captureCurrentElement() {
  if (!currentElement) return;

  const computed = window.getComputedStyle(currentElement);
  const allStyles: Record<string, string> = {};

  wantedProps.forEach((prop) => {
    const value = computed.getPropertyValue(prop);
    if (value && value !== "none" && value !== "auto" && value !== "normal" && value !== "0px" && value !== "rgba(0, 0, 0, 0)") {
      allStyles[prop] = value;
    }
  });

  const attributes: Record<string, string> = {};
  Array.from(currentElement.attributes).forEach((attr) => {
    if (attr.name !== 'style') { 
       attributes[attr.name] = attr.value;
    }
  });

  const payload = {
    tagName: currentElement.tagName.toLowerCase(),
    innerHTML: currentElement.innerHTML, 
    attributes: attributes, 
    styles: allStyles,
    timestamp: Date.now()
  };

  chrome.storage.local.set({ 'latestCapture': payload });
  chrome.runtime.sendMessage({ action: "CAPTURED_STYLES", data: payload }).catch(() => {});

  if (hudButton) {
   // const originalText = hudButton.innerText;
    hudButton.innerText = "✓ Copied!";
    hudButton.style.background = "#16a34a";
    setTimeout(() => {
        // Check if button still exists before modifying
        if (hudButton) {
            hudButton.innerText = "✚ Get HTML";
            hudButton.style.background = "#2563eb";
        }
        stopInspecting();
    }, 800);
  }
}

// 4. NEW: Updated Mouseover with Delay
document.addEventListener("mouseover", (event) => {
  if (!isInspecting || !hudButton) return;
  const target = event.target as HTMLElement;

  // Don't switch if we are hovering our own button
  if (target === overlayContainer || overlayContainer?.contains(target)) {
     if (selectionTimeout) clearTimeout(selectionTimeout);
     return;
  }

  // Clear pending switch
  if (selectionTimeout) clearTimeout(selectionTimeout);

  // Wait 80ms before switching. If mouse hits button in this time, switch is cancelled.
  selectionTimeout = setTimeout(() => {
      if (currentElement && currentElement !== target) currentElement.style.outline = "";
      
      currentElement = target;
      target.style.outline = "2px solid #3b82f6";
      
      const rect = target.getBoundingClientRect();
      
      // Adjusted positioning for the "Invisible Bridge"
      hudButton!.style.display = 'block';
      hudButton!.style.top = `${Math.max(0, rect.top - 28)}px`; // 28px above
      hudButton!.style.left = `${Math.max(0, rect.left)}px`;
  }, 80);

}, { capture: true });

function stopInspecting() {
  isInspecting = false;
  if (currentElement) { currentElement.style.outline = ""; currentElement = null; }
  if (hudButton) hudButton.style.display = 'none';
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "TOGGLE_PICKER") {
    isInspecting = request.payload;
    if (isInspecting) createOverlay(); else stopInspecting();
  }
});