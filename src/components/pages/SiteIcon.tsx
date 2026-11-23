import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { faviconUrlFor } from "../../utils/favicon";

// Site favicon with a globe fallback when the site does not serve one.
export function SiteIcon({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const src = faviconUrlFor(url);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!src || failed) {
    return <Globe className="h-4 w-4 shrink-0 text-zinc-500" />;
  }

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className="h-4 w-4 shrink-0 rounded-xs object-contain"
    />
  );
}