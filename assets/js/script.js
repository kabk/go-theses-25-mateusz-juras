function docReady(fn) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // --- BG Overlay ---
  // let bgOverlay = document.getElementById("bg-overlay");
  // if (!bgOverlay) {
  //   bgOverlay = document.createElement("div");
  //   bgOverlay.id = "bg-overlay";
  //   bgOverlay.style.position = "fixed";
  //   bgOverlay.style.top = "0";
  //   bgOverlay.style.left = "0";
  //   bgOverlay.style.width = "100%";
  //   bgOverlay.style.height = "100%";
  //   bgOverlay.style.backgroundColor = "black";
  //   bgOverlay.style.pointerEvents = "none"; // Allow clicks to pass through
  //   bgOverlay.style.zIndex = "-1"; // Behind page content
  //   bgOverlay.style.opacity = "0"; // Start transparent
  //   document.body.prepend(bgOverlay);
  // }

  // window.addEventListener("scroll", () => {
  //   const scrollTop = window.scrollY;
  //   const docHeight =
  //     document.documentElement.scrollHeight - window.innerHeight;
  //   const scrollFraction = scrollTop / docHeight;
  //   const opacity = Math.min(1, scrollFraction);
  //   bgOverlay.style.opacity = opacity;
  // });
  // --- Sticky Nav ---
  const stickyNav = document.getElementById("sticky-nav");
  let lastScroll = window.pageYOffset;
  window.addEventListener("scroll", function () {
    const currentScroll = window.pageYOffset;
    if (currentScroll < lastScroll) {
      // Reveal nav when scrolling up.
      stickyNav.style.transform = "translateY(0)";
    } else {
      // Hide nav when scrolling down.
      stickyNav.style.transform = "translateY(100%)";
    }
    lastScroll = currentScroll;
  });

  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = "!<>-_\\/[]{}—=+*^?#________";
      this.update = this.update.bind(this);
    }

    setText(newText) {
      const oldText = this.el.textContent;
      const length = Math.max(oldText.length, newText.length);
      // Fixed total duration (in frames) for the glitch effect
      const TOTAL_DURATION = 18; // You can adjust this value if needed
      const promise = new Promise((resolve) => (this.resolve = resolve));
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || "";
        const to = newText[i] || "";
        // Each character's glitch effect starts randomly between 0 and TOTAL_DURATION/2
        // and ends randomly between TOTAL_DURATION/2 and TOTAL_DURATION.
        const start = Math.floor(Math.random() * (TOTAL_DURATION / 2));
        const end =
          Math.floor(TOTAL_DURATION / 2) +
          Math.floor(Math.random() * (TOTAL_DURATION / 2));
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }

    update() {
      let output = "";
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          // With a 28% chance replace the character for a dynamic effect.
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="dud">${char}</span>`;
        } else {
          output += from;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  // Apply glitch effect on page load for the title.
  const titleEl = document.getElementById("glitch-title");
  if (titleEl) {
    const fxTitle = new TextScramble(titleEl);
    fxTitle.setText(titleEl.textContent);
  }

  // Use IntersectionObserver to trigger glitch effect on elements with "glitch-on-scroll"
  const scrollGlitchElements = document.querySelectorAll(".glitch-on-scroll");
  const observerOptions = { root: null, threshold: 0.1 };

  const glitchObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // If the element contains a child with "no-glitch", skip glitching it.
        if (el.querySelector(".no-glitch")) {
          return;
        }
        const finalText = el.textContent;
        const fx = new TextScramble(el);
        fx.setText(finalText);
      }
    });
  }, observerOptions);

  scrollGlitchElements.forEach((el) => glitchObserver.observe(el));

  // --- Image Blink Effect ---
  const images = document.querySelectorAll("img");
  const imageObserverOptions = { root: null, threshold: 0.5 };
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (!img.classList.contains("blinked")) {
          const iterations = Math.floor(Math.random() * 3) + 2;
          img.style.animation = `blink 0.5s ease-in-out ${iterations} forwards`;
          img.classList.add("blinked");
        }
      }
    });
  }, imageObserverOptions);
  images.forEach((img) => imageObserver.observe(img));

  // --- Noise Canvas Effect ---
  const canvas = document.getElementById("noise-canvas");
  const ctx = canvas.getContext("2d");
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  function generateNoise() {
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    const buffer32 = new Uint32Array(imageData.data.buffer);
    const len = buffer32.length;
    for (let i = 0; i < len; i++) {
      const gray = (Math.random() * 255) | 0;
      buffer32[i] = (255 << 24) | (gray << 16) | (gray << 8) | gray;
    }
    ctx.putImageData(imageData, 0, 0);
  }
  function animateNoise() {
    generateNoise();
    requestAnimationFrame(animateNoise);
  }
  animateNoise();
});

// --- Footnote Popup: Create Separate Popups for Each Footnote After 3 Seconds of Visibility ---
document.addEventListener("DOMContentLoaded", function () {
  // Select all footnote links. (Ensure they use a non-navigating URL, e.g., href="javascript:void(0)")
  const footnoteLinks = document.querySelectorAll("a.footnote");
  // Map to store timers for each footnote link.
  const footnoteTimers = new Map();

  // Create an IntersectionObserver for the footnote links.
  const popupObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          if (!footnoteTimers.has(el)) {
            const timer = setTimeout(() => {
              // Retrieve the footnote text.
              const text = el.getAttribute("data-footnote");
              // Create a new popup element.
              const popup = document.createElement("div");
              popup.className = "footnote-popup";
              popup.innerHTML = `
                <div class="footnote-content">${text}</div>
                <button class="close-footnote">Close</button>
              `;
              // Set initial styles for the popup.
              popup.style.position = "fixed";
              popup.style.background = "#f0f0f0";
              popup.style.border = "2px solid #000";
              popup.style.padding = "1rem";
              popup.style.width = "200px";
              popup.style.color = "#000";
              popup.style.zIndex = "10000";
              // Append the popup to the document body.
              document.body.appendChild(popup);

              // Constrain its random position within the viewport with a margin.
              const margin = 40;
              const viewportWidth = window.innerWidth;
              const viewportHeight = window.innerHeight;
              const popupWidth = popup.offsetWidth;
              const popupHeight = popup.offsetHeight;
              const randomLeft =
                margin +
                Math.random() * (viewportWidth - popupWidth - 2 * margin);
              const randomTop =
                margin +
                Math.random() * (viewportHeight - popupHeight - 2 * margin);
              popup.style.left = randomLeft + "px";
              popup.style.top = randomTop + "px";
              popup.style.transform = ""; // Remove centering transform.

              // Attach an event listener to the close button to remove this popup.
              const closeButton = popup.querySelector(".close-footnote");
              if (closeButton) {
                closeButton.addEventListener("click", () => {
                  popup.remove();
                });
              }

              footnoteTimers.delete(el);
            }, 5000); // 3-second delay
            footnoteTimers.set(el, timer);
          }
        } else {
          // Cancel the timer if the footnote link goes out of view.
          if (footnoteTimers.has(el)) {
            clearTimeout(footnoteTimers.get(el));
            footnoteTimers.delete(el);
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  footnoteLinks.forEach((link) => popupObserver.observe(link));
});

document.addEventListener("DOMContentLoaded", () => {
  const refreshButton = document.getElementById("refresh-button");
  refreshButton.addEventListener("click", () => {
    window.location.reload();
  });
});

// document.addEventListener("DOMContentLoaded", function () {
//   window.alert(
//     "If you're experiencing trouble loading the content, refreshing the website might help. Sorry about that!"
//   );
// });
