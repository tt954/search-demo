export const fetchArtworksByQuery = async ({
  queryKey,
}: any): Promise<Response<Artwork[]>["data"]> => {
  const [_key, { query }] = queryKey;
  const response = await fetch(
    `https://api.artic.edu/api/v1/artworks/search?q=${query}`
  );
  await new Promise((resolve) => setTimeout(resolve, 3000)); // similate slow network to see caching effects
  const { data } = await response.json();
  return data;
};

export const fetchArtworkById = async ({
  queryKey,
}: any): Promise<Response> => {
  const [_key, { id }] = queryKey;
  const response = await fetch(
    `https://api.artic.edu/api/v1/artworks/${id}?fields=id,title,artist_display,date_display,medium_display,image_id,thumbnail,description`
  );
  const data = await response.json();
  return data;
};

// export const fetchArtworkImage = async ({ queryKey }: any): Promise<Blob> => {};

// https://api.artic.edu/api/v1/artworks/search?q=cats full-text search
// https://api.artic.edu/api/v1/artworks?page=2&limit=100 pagination
// https://api.artic.edu/api/v1/artworks/129884?fields=id,title,artist_display,date_display,medium_display,image_id,thumbnail,description specific fields

export interface Artwork {
  id: number;
  title: string;
  description: string;
  artist_display: string;
  date_display: string;
  medium_display: string;
  image_id: string;
  thumbnail: {
    lqip: string;
    width: number;
    height: number;
    alt_text: string;
  };
}

interface Response<T = Artwork> {
  data: T;
  pagination: { total: number; limit: number; offset: number };
  config: { iiif_url: string };
}
