export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

export function getQueryParam(name) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function normalizePostResponse(json) {
  return json?.data ?? json ?? {};
}

export function normalizeCommentsResponse(json) {
  const payload = json?.data ?? json ?? {};
  let list = [];
  if (Array.isArray(payload)) list = payload;
  else if (Array.isArray(payload.content)) list = payload.content;
  else if (Array.isArray(payload.items)) list = payload.items;

  const meta = {
    last: typeof payload.last === 'boolean' ? payload.last : undefined,
    page: typeof payload.number === 'number' ? payload.number : undefined,
    totalElements:
      typeof payload.totalElements === 'number'
        ? payload.totalElements
        : undefined,
  };

  return { list, meta };
}

export function convertNewLinesToBreaks(text = '') {
  return (text || '').replace(/\n/g, '<br />');
}
