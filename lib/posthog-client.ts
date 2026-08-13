"use client"

export type PostHogClient = typeof import("posthog-js").default

let postHogClient: PostHogClient | null = null

export async function loadPostHogClient() {
  if (postHogClient) return postHogClient
  const module = await import("posthog-js")
  postHogClient = module.default
  return postHogClient
}

export function getLoadedPostHogClient() {
  return postHogClient
}
