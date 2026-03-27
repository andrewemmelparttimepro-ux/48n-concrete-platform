function withProtocol(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export function getSiteUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicitUrl) {
    return withProtocol(explicitUrl);
  }

  if (process.env.VERCEL_URL) {
    return withProtocol(process.env.VERCEL_URL);
  }

  return "https://www.48nconcrete.com";
}
