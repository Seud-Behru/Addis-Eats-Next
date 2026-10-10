// The one fetcher every SWR call in this app uses. A non-2xx response
// throws, so SWR's `error` is populated and an error UI can react to it.
export default async function fetcher(url) {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("Request failed.");
    error.status = res.status;
    try {
      error.info = await res.json();
    } catch {
      // body wasn't JSON — leave error.info unset
    }
    throw error;
  }

  return res.json();
}
