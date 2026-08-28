// Lightweight toast system that does NOT rely on React hooks or a subscriber
// component. Each `toast()` call renders a self-contained DOM notification,
// so it works even when React's internal dispatcher is unavailable (the
// "Cannot read properties of null (reading 'useState')" crash that occurred
// in the old <Toaster /> subscriber).
//
// Exports `toast` (call from anywhere) and `useToast` (returns `{ toast,
// dismiss }` without calling any React hook, kept for backward compatibility
// with components that destructure `const { toast } = useToast()`).

let container = null;

function ensureContainer() {
  if (container && document.body.contains(container)) return container;
  container = document.createElement("div");
  container.style.cssText = [
    "position:fixed",
    "z-index:9999",
    "top:1rem",
    "right:1rem",
    "display:flex",
    "flex-direction:column",
    "gap:0.5rem",
    "pointer-events:none",
    "max-width:calc(100vw - 2rem)",
  ].join(";");
  document.body.appendChild(container);
  return container;
}

function variantClasses(variant) {
  if (variant === "destructive") {
    return "background:#7f1d1d;color:#fee2e2;border:1px solid #991b1b";
  }
  return "background:#0f766e;color:#ffffff;border:1px solid #115e59";
}

function toast(props = {}) {
  const {
    title,
    description,
    variant,
    duration = 4000,
  } = props;

  const root = document.createElement("div");
  root.style.cssText = [
    "pointer-events:auto",
    "border-radius:0.75rem",
    "padding:0.75rem 1rem",
    "box-shadow:0 10px 25px -10px rgba(0,0,0,0.4)",
    "font-family:Inter,system-ui,sans-serif",
    "font-size:0.875rem",
    "line-height:1.25rem",
    "min-width:16rem",
    "max-width:24rem",
    "opacity:0",
    "transform:translateY(-6px)",
    "transition:opacity 160ms ease-out,transform 160ms ease-out",
    variantClasses(variant),
  ].join(";");

  const inner = document.createElement("div");
  inner.style.cssText = "display:grid;gap:0.25rem";
  if (title) {
    const t = document.createElement("div");
    t.textContent = title;
    t.style.fontWeight = "600";
    inner.appendChild(t);
  }
  if (description) {
    const d = document.createElement("div");
    d.textContent = description;
    d.style.opacity = "0.9";
    inner.appendChild(d);
  }
  root.appendChild(inner);

  const host = ensureContainer();
  host.appendChild(root);
  // Animate in on next frame.
  requestAnimationFrame(() => {
    root.style.opacity = "1";
    root.style.transform = "translateY(0)";
  });

  const dismiss = () => {
    root.style.opacity = "0";
    root.style.transform = "translateY(-6px)";
    setTimeout(() => {
      if (root.parentNode) root.parentNode.removeChild(root);
    }, 180);
  };

  const timer = setTimeout(dismiss, duration);
  root.addEventListener("click", () => {
    clearTimeout(timer);
    dismiss();
  });

  return { dismiss };
}

// Backward-compatible hook. Returns the imperative API WITHOUT calling any
// React hook, so it is safe to destructure in any component.
function useToast() {
  return {
    toasts: [],
    toast,
    dismiss: () => {},
  };
}

export { useToast, toast };
