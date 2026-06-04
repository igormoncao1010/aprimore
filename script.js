const topbar = document.querySelector(".topbar");
const stickyCta = document.querySelector(".sticky-cta");
const revealEls = document.querySelectorAll(".reveal");
const form = document.querySelector(".lead-form");

const updateChrome = () => {
  const isScrolled = window.scrollY > 18;
  topbar.classList.toggle("scrolled", isScrolled);
  stickyCta.classList.toggle("visible", window.scrollY > 520);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealEls.forEach((el) => observer.observe(el));
window.addEventListener("scroll", updateChrome, { passive: true });
updateChrome();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const button = form.querySelector("button");
  const status = form.querySelector(".form-status");
  const originalText = button.textContent;
  const payload = Object.fromEntries(new FormData(form).entries());

  button.textContent = "Enviando...";
  button.disabled = true;
  status.textContent = "";
  status.classList.remove("error", "success");

  fetch(form.action, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel enviar seus dados.");
      }

      status.textContent = "Recebemos seus dados. Nossa equipe vai entrar em contato em breve.";
      status.classList.add("success");
      form.reset();
    })
    .catch(() => {
      status.textContent = "Nao foi possivel enviar agora. Tente novamente em alguns instantes.";
      status.classList.add("error");
    })
    .finally(() => {
      button.textContent = originalText;
      button.disabled = false;
    });
});
