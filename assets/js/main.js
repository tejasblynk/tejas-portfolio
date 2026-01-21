// Loader hide
window.addEventListener("load", () => {
  setTimeout(() => {
    const l = document.getElementById("loader");
    if (l) l.style.display = "none";
  }, 1600);
});

// Dynamic background glow
document.addEventListener("mousemove", e => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  document.body.style.background =
    `radial-gradient(circle at ${x}% ${y}%, #0c1430, #05070c 70%)`;
});

// Scroll reveal system
const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, { threshold: 0.15 });

reveals.forEach(r => observer.observe(r));

// Page transition glow
document.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", e => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    e.preventDefault();
    document.body.style.opacity = "0";
    setTimeout(() => window.location = href, 250);
  });
});
