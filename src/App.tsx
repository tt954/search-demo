import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { fetchArtworkById, fetchArtworksByQuery } from "./lib/artwork";
import type { Artwork } from "./lib/artwork";

import "./App.css";

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

  const [currentPage, setCurrentPage] = useState(1);

  const {
    isPending,
    isFetching,
    data: searchResults,
    error,
  } = useQuery({
    queryKey: ["artworks", query],
    queryFn: () => fetchArtworksByQuery(query),
  });

  const artworks = searchResults?.data || [];
  const { total_pages } = searchResults?.pagination || {};

  const handleNextPage = () => setCurrentPage((prev) => prev + 1);
  const handlePreviousPage = () => setCurrentPage((prev) => prev - 1);

  if (isPending) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>{`Error fetching data: ${error}`}</p>;
  }
  return (
    <div className="results__container">
      {!isPending && artworks.length > 0 && (
        <>
          <h2>{`Results for: ${query}`}</h2>
          <ul className="results">
            {artworks.map((artwork) => (
              <Artwork key={artwork.id} {...artwork} />
            ))}
          </ul>
          <div className="results__buttons">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === total_pages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {!isPending && !error && artworks.length === 0 && (
        <p>{`No results found for: ${query}`}</p>
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
    <form action={handleSubmit} className="search__form">
      <input type="text" name="query" />
      <button type="submit">Search</button>
    </form>
  );
}

export default function App() {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <h1 className="title">Search for your favorite artworks</h1>
      <main>
        <Search submitSearchValue={setSearchTerm} />
        <Artworks query={searchTerm} />
        <ReactQueryDevtools initialIsOpen={false} />
      </main>
    </QueryClientProvider>
  );
}
