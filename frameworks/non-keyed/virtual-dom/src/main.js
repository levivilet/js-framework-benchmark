import { applyPatch, renderInto } from "@lvce-editor/virtual-dom"
import { createRpc } from "./rpc.js"

const app = document.getElementById("app")
const worker = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",
})

let root = null

const rpc = createRpc(worker, {
  render({ nodes }) {
    app.replaceChildren()
    renderInto(app, nodes)
    root = app.firstElementChild
  },
  renderHtml({ html }) {
    app.innerHTML = html
    root = app.firstElementChild
  },
  patch({ patches }) {
    if (root) {
      applyPatch(root, patches)
    }
  },
})

const dispatch = (action, id) => {
  rpc.notify("update", { action, id })
}

app.addEventListener("click", (event) => {
  const target = event.target
  const button = target.closest("button")
  if (button) {
    event.preventDefault()
    dispatch(button.id)
    return
  }

  const removeLink = target.closest("a.remove")
  if (removeLink) {
    event.preventDefault()
    const row = removeLink.closest("tr")
    if (row) {
      dispatch("remove", Number(row.dataset.id))
    }
    return
  }

  const labelLink = target.closest("a.lbl")
  if (labelLink) {
    event.preventDefault()
    const row = labelLink.closest("tr")
    if (row) {
      dispatch("select", Number(row.dataset.id))
    }
  }
})

dispatch("init")
