const typpy = require("typpy")
    , iterateObj = require("iterate-object")
    , Err = require("err")
    , objDef = require("obj-def")
    , emptyObj = require("is-empty-obj");

export interface ScrapeOptions {
  [key: string]: string | ScrapeOptionList | ScrapeOptionElement;
}

export interface ScrapeOptionElement {
  selector?: string;
  convert?: (value: any) => any;
  how?: string | ((element: JQuery<HTMLElement>) => any);
  attr?: string;
  trim?: boolean;
  closest?: string;
  eq?: number;
  texteq?: number;
}

export interface ScrapeOptionList {
  listItem: string;
  data?: ScrapeOptions;
  convert?: (value: any) => any;
}

export default function scrapeHTML<T>($root: JQuery<HTMLElement>, opts: ScrapeOptions): T {
  // Normalizes the option
  const normalizeOpt = v => {
      if (typpy(v, String)) {
          v = { selector: v }
      }
      objDef(v, "data", {})
      objDef(v, "how", "text", true)
      if (v.attr) {
          v.how = $elm => $elm.attr(v.attr)
      }
      objDef(v, "trimValue", true)
      objDef(v, "closest", "")
      return v
  }

  // Recursively handles the data
  const handleDataObj = (data, $context?) => {
      let pageData: any = {}
      iterateObj(data, (cOpt, optName) => {

          cOpt = normalizeOpt(cOpt)
          cOpt.name = optName

          let $cContext = $context === $root ? undefined : $context
          if (!$cContext && !cOpt.selector && !cOpt.listItem) {
              throw new Err("There is no element selected for the '<option.name>' field. Please provide a selector, list item or use nested object structure.", {
                  option: cOpt
                , code: "NO_ELEMENT_SELECTED"
              })
          }

          let $elm = cOpt.selector ? ($cContext || $root).find(cOpt.selector) : $cContext

          // Handle lists
          if (cOpt.listItem) {
              let docs = pageData[cOpt.name] = []
                , $items = ($cContext || $root).find(cOpt.listItem)
                , isEmpty = emptyObj(cOpt.data)


              if (isEmpty) {
                  cOpt.data.___raw = {}
              }

              for (let i = 0; i < $items.length; ++i) {
                  let cDoc: any = handleDataObj(cOpt.data, $items.eq(i))
                  let convert = cOpt.convert || function(x) { return x }
                  docs.push(convert(cDoc.___raw || cDoc))
              }
          } else {

              if (typpy(cOpt.eq, Number)) {
                  $elm = $elm.eq(cOpt.eq)
              }

              if (typpy(cOpt.texteq, Number)) {
                  let children = $elm.contents()
                    , textCounter = 0
                    , found = false

                  for (let i = 0, child; child = children[i]; i++) {
                      if (child.type === "text") {
                          if (textCounter == cOpt.texteq) {
                              $elm = child
                              found = true
                              break;
                          }
                          textCounter++
                      }
                  }

                  if (!found) {
                      $elm = $root.find("")
                  }

                  cOpt.how = elm => elm.data;
              }

              // Handle closest
              if (cOpt.closest) {
                  $elm = $elm.closest(cOpt.closest)
              }

              if (!emptyObj(cOpt.data)) {
                  pageData[cOpt.name] = handleDataObj(cOpt.data, $elm)
                  return pageData
              }

              let value = typpy(cOpt.how, Function) ? cOpt.how($elm) : $elm[cOpt.how]()
              value = value === undefined ? "" : value
              if (cOpt.trimValue && typpy(value, String)) {
                  value = value.trim()
              }

              if (cOpt.convert) {
                  value = cOpt.convert(value, $elm)
              }

              pageData[cOpt.name] = value
          }
      })
      return pageData
  }


  return handleDataObj(opts)
}
