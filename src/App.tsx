import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

const queryClient = new QueryClient();

interface Artwork {
  id: number;
  title: string;
  artist_display: string;
  artist_id: string;
  date_display: string;
}

const fetchArtworksBySearchTerm = async ({
  queryKey,
}: any): Promise<Artwork[]> => {
  const [_key, { searchTerm }] = queryKey;
  const response = await fetch(
    `https://api.artic.edu/api/v1/artworks/search?q=${searchTerm}`
  );
  const { data } = await response.json();
  return data;
};

function Artworks({ searchTerm = null }: { searchTerm?: string | null }) {
  const { status, data, error } = useQuery({
    queryKey: ["artworks", { searchTerm }],
    queryFn: fetchArtworksBySearchTerm,
  });

  if (status === "pending") {
    return <p>Fetching data...</p>;
  }
  if (error) {
    return <p>{`Error fetching data: ${error}`}</p>;
  }
  if (!searchTerm) {
    return <p>Start typing for search for artworks</p>;
  }
  return (
    <div>
      <h2>{`Results for: ${searchTerm}`}</h2>
      <ul>
        {data.map((artwork) => (
          <li key={artwork.id}>
            <p>{artwork.title}</p>
            <p>{artwork.date_display}</p>
            <p>{artwork.artist_display}</p>
          </li>
        ))}
      </ul>
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
      <Artworks searchTerm={searchTerm} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
