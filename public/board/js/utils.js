export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

export function normalizePostsResponse(json) {
  const payload = json?.data ?? json ?? {};
  let list = [];

  if (Array.isArray(payload)) list = payload;
  else if (Array.isArray(payload.content)) list = payload.content;
  else if (Array.isArray(payload.posts)) list = payload.posts;
  else if (Array.isArray(payload.postList)) list = payload.postList;
  else if (Array.isArray(payload.items)) list = payload.items;

  const meta = {
    last: typeof payload.last === 'boolean' ? payload.last : undefined,
    totalPages:
      typeof payload.totalPages === 'number' ? payload.totalPages : undefined,
    pageNumber:
      typeof payload.number === 'number' ? payload.number : undefined,
  };

  return { list, meta };
}
