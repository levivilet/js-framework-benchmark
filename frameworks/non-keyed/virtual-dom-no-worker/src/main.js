import { applyPatch, renderInto } from "@lvce-editor/virtual-dom"
import { VirtualDomElements, diffTree } from "@lvce-editor/virtual-dom-worker"

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

const app = document.getElementById("app")

let data = []
let nextId = 1
let selected = null
let currentNodes = []
let root = null

const random = (max) => Math.round(Math.random() * 1000) % max

const getButtonDom = (id, label) => [
  {
    type: Div,
    className: "col-sm-6 smallpad",
    childCount: 1,
  },
  {
    type: Button,
    id,
    className: "btn btn-primary btn-block",
    childCount: 1,
  },
  {
    type: Text,
    text: label,
    childCount: 0,
  },
]

const BUTTONS = [
  getButtonDom("run", "Create 1,000 rows"),
  getButtonDom("runlots", "Create 10,000 rows"),
  getButtonDom("add", "Append 1,000 rows"),
  getButtonDom("update", "Update every 10th row"),
  getButtonDom("clear", "Clear"),
  getButtonDom("swaprows", "Swap Rows"),
]

const BUTTON_ROW_DOM = [
  {
    type: Div,
    className: "row",
    childCount: BUTTONS.length,
  },
  ...BUTTONS.flat(),
]

const HEADER_TITLE_DOM = [
  {
    type: Div,
    className: "col-md-6",
    childCount: 1,
  },
  {
    type: H1,
    childCount: 1,
  },
  {
    type: Text,
    text: "virtual-dom-no-worker",
    childCount: 0,
  },
]

const HEADER_ACTIONS_DOM = [
  {
    type: Div,
    className: "col-md-6",
    childCount: 1,
  },
  ...BUTTON_ROW_DOM,
]

const CONTAINER_NODE = {
  type: Div,
  className: "container",
  id: "main",
  childCount: 3,
}

const JUMBOTRON_NODE = {
  type: Div,
  className: "jumbotron",
  childCount: 1,
}

const HEADER_ROW_NODE = {
  type: Div,
  className: "row",
  childCount: 2,
}

const TABLE_NODE = {
  type: Table,
  className: "table table-hover table-striped test-data",
  childCount: 1,
}

const PRELOAD_ICON_DOM = [
  {
    type: Span,
    className: "preloadicon glyphicon glyphicon-remove",
    "aria-hidden": "true",
    childCount: 0,
  },
]

const ROW_ID_CELL_DOM = [
  {
    type: Td,
    className: "col-md-1",
    childCount: 1,
  },
]

const ROW_LABEL_CELL_DOM = [
  {
    type: Td,
    className: "col-md-4",
    childCount: 1,
  },
  {
    type: A,
    className: "lbl",
    childCount: 1,
  },
]

const ROW_REMOVE_CELL_DOM = [
  {
    type: Td,
    className: "col-md-1",
    childCount: 1,
  },
  {
    type: A,
    className: "remove",
    childCount: 1,
  },
  {
    type: Span,
    className: "remove glyphicon glyphicon-remove",
    "aria-hidden": "true",
    childCount: 0,
  },
]

const ROW_EMPTY_CELL_DOM = [
  {
    type: Td,
    className: "col-md-6",
    childCount: 0,
  },
]

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

const getRowDom = (item) => [
  {
    type: Tr,
    className: item.id === selected ? "danger" : "",
    "data-id": String(item.id),
    childCount: 4,
  },
  ...ROW_ID_CELL_DOM,
  {
    type: Text,
    text: String(item.id),
    childCount: 0,
  },
  ...ROW_LABEL_CELL_DOM,
  {
    type: Text,
    text: item.label,
    childCount: 0,
  },
  ...ROW_REMOVE_CELL_DOM,
  ...ROW_EMPTY_CELL_DOM,
]

const view = () => {
  const rowNodes = data.flatMap(getRowDom)
  return [
    CONTAINER_NODE,
    JUMBOTRON_NODE,
    HEADER_ROW_NODE,
    ...HEADER_TITLE_DOM,
    ...HEADER_ACTIONS_DOM,
    TABLE_NODE,
    {
      type: TBody,
      childCount: data.length,
    },
    ...rowNodes,
    ...PRELOAD_ICON_DOM,
  ]
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

const render = (nodes) => {
  app.replaceChildren()
  renderInto(app, nodes)
  root = app.firstElementChild
}

const dispatch = (action, id) => {
  update(action, id)
  const nextNodes = view()
  if (currentNodes.length === 0) {
    currentNodes = nextNodes
    render(nextNodes)
    return
  }
  const patches = diffTree(currentNodes, nextNodes)
  currentNodes = nextNodes
  if (root) {
    applyPatch(root, patches)
  }
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
