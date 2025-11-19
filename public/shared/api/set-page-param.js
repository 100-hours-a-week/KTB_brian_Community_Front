export function setPageParams(url, page, size) {
    url = new URL(url);
    url.searchParams.set('page', page);
    url.searchParams.set('size', size);

    return url.toString();
}

