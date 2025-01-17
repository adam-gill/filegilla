import { Search, X } from "lucide-react";
import { Input } from "./ui/input";

interface searchProps {
  search: string;
  setSearch: (value: string) => void;
}

const SearchBar: React.FC<searchProps> = ({ search, setSearch }) => {
  return (
    <div className="w-fit flex flex-row items-center ml-4">
      <div className="relative block">
        {search === "" ? (
          <Search
            size={24}
            className="stroke-white absolute right-2 top-1/2 -translate-y-1/2"
          />
        ) : (
          <X
            size={24}
            className="stroke-white cursor-pointer absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setSearch("")}
          />
        )}
        <Input
          className="max-w-[256px]"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
      </div>
    </div>
  );
};

export default SearchBar;
