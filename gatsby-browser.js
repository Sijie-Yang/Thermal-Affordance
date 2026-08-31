export const onClientEntry = () => {
  if (process.env.NODE_ENV !== "development") return
  window.addEventListener("error", event => {
    const node = document.createElement("pre")
    node.setAttribute("data-runtime-error", "true")
    node.style.cssText =
      "position:fixed;z-index:99999;left:8px;bottom:8px;max-width:90%;padding:8px;background:#fff3cd;border:1px solid #c9a227;white-space:pre-wrap;"
    node.textContent = event.message || String(event.error || "Unknown error")
    document.body.appendChild(node)
  })
}
