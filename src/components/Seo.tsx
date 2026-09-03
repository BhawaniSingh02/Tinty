/**
 * Per-route SEO tags. React 19 hoists <title>/<meta> rendered anywhere in the
 * tree into <head>, so each route just renders <Seo …/> near its top.
 *
 * The static index.html carries sensible defaults for crawlers/clients that
 * don't run JS; this overrides them once React mounts.
 */

const SITE = 'https://tinty.fun'
const OG_IMAGE = `${SITE}/logo.png`

type Props = {
  title: string
  description: string
  /** Path for the canonical + og:url, e.g. "/price". Omit for challenge links. */
  path?: string
  /** Keep dynamic, per-player pages (challenge links) out of the index. */
  noindex?: boolean
}

export default function Seo({ title, description, path, noindex }: Props) {
  const url = path ? `${SITE}${path}` : undefined
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Tinty" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={OG_IMAGE} />
      {url && <meta property="og:url" content={url} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </>
  )
}
