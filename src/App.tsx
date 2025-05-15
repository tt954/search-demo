import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { fetchArtworkById, fetchArtworksByQuery } from "./lib/artwork";
import type { Artwork } from "./lib/artwork";

const queryClient = new QueryClient();

function Artwork(artwork: Artwork) {
  const { id, title } = artwork;

  const { data } = useQuery({
    queryKey: ["artwork", { id }],
    queryFn: fetchArtworkById,
  });
  const { artist_display, date_display, medium_display } = data?.data || {};

  return (
    <li>
      <p>{title}</p>
      {data?.data && (
        <>
          <p>{artist_display}</p>
          <p>{date_display}</p>
          <p>{medium_display}</p>
        </>
      )}
    </li>
  );
}

function Artworks({ query = null }: { query?: string | null }) {
  if (!query) {
    return <p>Start typing for search for artworks</p>;
  }

  const { status, data, error } = useQuery({
    queryKey: ["artworks", { query }],
    queryFn: fetchArtworksByQuery,
  });

  if (status === "pending") {
    return <p>Fetching data...</p>;
  }
  if (error) {
    return <p>{`Error fetching data: ${error}`}</p>;
  }
  return (
    <div>
      {data.length === 0 && <h2>{`No results found for: ${query}`}</h2>}
      {data.length > 0 && (
        <>
          <h2>{`Results for: ${query}`}</h2>
          <ul>
            {data.map((artwork) => (
              <Artwork key={artwork.id} {...artwork} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Search({
  submitSearchValue,
}: {
  submitSearchValue: (value: string) => void;
}) {
  const handleSubmit = (formData: FormData) => {
    const query = formData.get("query") as string;
    submitSearchValue(query);
  };

  return (
    <form action={handleSubmit}>
      <input type="text" name="query" />
      <button type="submit">Search</button>
    </form>
  );
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <h1>Artworks</h1>
      <Search submitSearchValue={setSearchTerm} />
      <Artworks query={searchTerm} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
