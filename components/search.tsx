import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
import { useEffect, useRef } from "react";

interface searchProps {
  search: string;
  setSearch: (value: string) => void;
}

const SearchBar: React.FC<searchProps> = ({ search, setSearch }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="w-fit flex flex-row items-center ml-4 sm:ml-2 sm:w-1/2">
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
          ref={inputRef}
          className="max-w-[256px]"
          value={search}
          placeholder={`Press "/" to search`}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
      </div>
    </div>
  );
};

export default SearchBar;
