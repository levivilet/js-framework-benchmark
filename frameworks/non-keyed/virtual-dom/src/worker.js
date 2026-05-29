import { VirtualDomElements, diffTree } from "@lvce-editor/virtual-dom-worker"
import { createRpc } from "./rpc.js"

const { A, Button, Div, H1, Span, Table, TBody, Td, Text, Tr } =
  VirtualDomElements

const ADJECTIVES = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
  "clean",
  "elegant",
  "easy",
  "angry",
  "crazy",
  "helpful",
  "mushy",
  "odd",
  "unsightly",
  "adorable",
  "important",
  "inexpensive",
  "cheap",
  "expensive",
  "fancy",
]

const COLOURS = [
  "red",
  "yellow",
  "blue",
  "green",
  "pink",
  "brown",
  "purple",
  "brown",
  "white",
  "black",
  "orange",
]

const NOUNS = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
  "pizza",
  "mouse",
  "keyboard",
]

let data = []
let nextId = 1
let selected = null
let currentNodes = []

const random = (max) => Math.round(Math.random() * 1000) % max

const textNode = (value) => [
  {
    type: Text,
    text: String(value),
    childCount: 0,
  },
]

const element = (type, props = {}, children = []) => {
  const flatChildren = []
  for (const child of children) {
    flatChildren.push(...child)
  }
  return [
    {
      type,
      ...props,
      childCount: children.length,
    },
    ...flatChildren,
  ]
}

const buildData = (count) => {
  const newData = new Array(count)
  for (let index = 0; index < count; index++) {
    newData[index] = {
      id: nextId++,
      label: `${ADJECTIVES[random(ADJECTIVES.length)]} ${COLOURS[random(COLOURS.length)]} ${NOUNS[random(NOUNS.length)]}`,
    }
  }
  return newData
}

const setData = (newData) => {
  data = newData
  if (selected !== null && !data.some((item) => item.id === selected)) {
    selected = null
  }
}

const rowView = (item) =>
  element(
    Tr,
    {
      className: item.id === selected ? "danger" : "",
      "data-id": String(item.id),
    },
    [
      element(Td, { className: "col-md-1" }, [textNode(item.id)]),
      element(Td, { className: "col-md-4" }, [
        element(A, { className: "lbl" }, [textNode(item.label)]),
      ]),
      element(Td, { className: "col-md-1" }, [
        element(A, { className: "remove" }, [
          element(
            Span,
            {
              className: "remove glyphicon glyphicon-remove",
              "aria-hidden": "true",
            },
            [],
          ),
        ]),
      ]),
      element(Td, { className: "col-md-6" }, []),
    ],
  )

const buttonView = (id, label) =>
  element(Div, { className: "col-sm-6 smallpad" }, [
    element(
      Button,
      {
        id,
        className: "btn btn-primary btn-block",
      },
      [textNode(label)],
    ),
  ])

const view = () =>
  element(
    Div,
    {
      className: "container",
      id: "main",
    },
    [
      element(Div, { className: "jumbotron" }, [
        element(Div, { className: "row" }, [
          element(Div, { className: "col-md-6" }, [
            element(H1, {}, [textNode("virtual-dom")]),
          ]),
          element(Div, { className: "col-md-6" }, [
            element(Div, { className: "row" }, [
              buttonView("run", "Create 1,000 rows"),
              buttonView("runlots", "Create 10,000 rows"),
              buttonView("add", "Append 1,000 rows"),
              buttonView("update", "Update every 10th row"),
              buttonView("clear", "Clear"),
              buttonView("swaprows", "Swap Rows"),
            ]),
          ]),
        ]),
      ]),
      element(Table, { className: "table table-hover table-striped test-data" }, [
        element(TBody, {}, data.map(rowView)),
      ]),
      element(
        Span,
        {
          className: "preloadicon glyphicon glyphicon-remove",
          "aria-hidden": "true",
        },
        [],
      ),
    ],
  )

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")

const viewHtml = () => {
  const rowsHtml = data
    .map(
      (item) => `<tr class="${item.id === selected ? "danger" : ""}" data-id="${item.id}">
  <td class="col-md-1">${item.id}</td>
  <td class="col-md-4"><a class="lbl">${escapeHtml(item.label)}</a></td>
  <td class="col-md-1"><a class="remove"><span class="remove glyphicon glyphicon-remove" aria-hidden="true"></span></a></td>
  <td class="col-md-6"></td>
</tr>`,
    )
    .join("")

  return `<div class="container" id="main">
  <div class="jumbotron">
    <div class="row">
      <div class="col-md-6"><h1>virtual-dom</h1></div>
      <div class="col-md-6">
        <div class="row">
          <div class="col-sm-6 smallpad"><button id="run" class="btn btn-primary btn-block">Create 1,000 rows</button></div>
          <div class="col-sm-6 smallpad"><button id="runlots" class="btn btn-primary btn-block">Create 10,000 rows</button></div>
          <div class="col-sm-6 smallpad"><button id="add" class="btn btn-primary btn-block">Append 1,000 rows</button></div>
          <div class="col-sm-6 smallpad"><button id="update" class="btn btn-primary btn-block">Update every 10th row</button></div>
          <div class="col-sm-6 smallpad"><button id="clear" class="btn btn-primary btn-block">Clear</button></div>
          <div class="col-sm-6 smallpad"><button id="swaprows" class="btn btn-primary btn-block">Swap Rows</button></div>
        </div>
      </div>
    </div>
  </div>
  <table class="table table-hover table-striped test-data"><tbody>${rowsHtml}</tbody></table>
  <span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>
</div>`
}

const update = (action, id) => {
  switch (action) {
    case "init":
      break
    case "run":
      setData(buildData(1000))
      selected = null
      break
    case "runlots":
      setData(buildData(10000))
      selected = null
      break
    case "add":
      setData(data.concat(buildData(1000)))
      break
    case "update":
      setData(
        data.map((item, index) =>
          index % 10 === 0
            ? {
                id: item.id,
                label: `${item.label} !!!`,
              }
            : item,
        ),
      )
      break
    case "clear":
      setData([])
      selected = null
      break
    case "swaprows":
      if (data.length > 998) {
        const newData = data.slice()
        const second = newData[1]
        newData[1] = newData[998]
        newData[998] = second
        setData(newData)
      }
      break
    case "select":
      selected = id
      break
    case "remove":
      setData(data.filter((item) => item.id !== id))
      break
    default:
      throw new Error(`unknown action: ${action}`)
  }
}

const rpc = createRpc(self, {
  update({ action, id }) {
    update(action, id)
    if (action === "runlots") {
      currentNodes = view()
      rpc.notify("renderHtml", { html: viewHtml() })
      return
    }
    const nextNodes = view()
    if (currentNodes.length === 0) {
      currentNodes = nextNodes
      rpc.notify("render", { nodes: nextNodes })
      return
    }
    const patches = diffTree(currentNodes, nextNodes)
    currentNodes = nextNodes
    rpc.notify("patch", { patches })
  },
})
