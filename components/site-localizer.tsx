"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { translateSiteText } from "@/lib/site-localization"

const translatedAttributes = ["aria-label", "placeholder", "title"] as const
const ignoredTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"])

export function SiteLocalizer() {
  const { locale } = useLanguage()
  const pathname = usePathname()
  const originalText = useRef(new WeakMap<Text, string>())
  const renderedText = useRef(new WeakMap<Text, string>())
  const originalAttributes = useRef(new WeakMap<Element, Map<string, string>>())
  const renderedAttributes = useRef(new WeakMap<Element, Map<string, string>>())

  useEffect(() => {
    if (pathname.startsWith("/admin")) return

    const isIgnored = (element: Element | null) => {
      if (!element) return true
      return ignoredTags.has(element.tagName) || Boolean(element.closest("[data-no-localize]"))
    }

    const localizeTextNode = (node: Text, force = false) => {
      const parent = node.parentElement
      if (isIgnored(parent)) return

      const current = node.nodeValue || ""
      const lastRendered = renderedText.current.get(node)
      if (!force && current !== lastRendered) originalText.current.set(node, current)
      const source = originalText.current.get(node) ?? current
      originalText.current.set(node, source)
      const translated = translateSiteText(source, locale)
      renderedText.current.set(node, translated)
      if (current !== translated) node.nodeValue = translated
    }

    const localizeAttributes = (element: Element, force = false) => {
      if (isIgnored(element)) return
      const sources = originalAttributes.current.get(element) || new Map<string, string>()
      const rendered = renderedAttributes.current.get(element) || new Map<string, string>()

      for (const attribute of translatedAttributes) {
        const current = element.getAttribute(attribute)
        if (current === null) continue
        if (!force && current !== rendered.get(attribute)) sources.set(attribute, current)
        const source = sources.get(attribute) ?? current
        const translated = translateSiteText(source, locale)
        rendered.set(attribute, translated)
        if (current !== translated) element.setAttribute(attribute, translated)
      }

      originalAttributes.current.set(element, sources)
      renderedAttributes.current.set(element, rendered)
    }

    const localizeTree = (root: Node, force = false) => {
      if (root.nodeType === Node.TEXT_NODE) {
        localizeTextNode(root as Text, force)
        return
      }
      if (!(root instanceof Element) && root !== document.body) return
      if (root instanceof Element) localizeAttributes(root, force)
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
      let current = walker.nextNode()
      while (current) {
        if (current.nodeType === Node.TEXT_NODE) localizeTextNode(current as Text, force)
        else localizeAttributes(current as Element, force)
        current = walker.nextNode()
      }
    }

    localizeTree(document.body, true)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") localizeTextNode(mutation.target as Text)
        if (mutation.type === "attributes" && mutation.target instanceof Element) localizeAttributes(mutation.target)
        for (const node of mutation.addedNodes) localizeTree(node)
      }
    })

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatedAttributes],
    })

    return () => observer.disconnect()
  }, [locale, pathname])

  return null
}
