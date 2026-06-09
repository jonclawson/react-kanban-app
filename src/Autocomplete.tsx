import { useState, useRef, useEffect, useId, useDeferredValue, useCallback } from "react";
import type { Character } from "./types";
import { useDebounce } from "./useDebounce";

interface AutocompleteProps {
  characters: Character[];
  value: string;
  onChange: (id: string) => void;
  onType: (name: string) => void;
}



export default function Autocomplete({ characters, value, onChange, onType }: AutocompleteProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedChar = characters.find((c) => c.id === value);

  const [query, setQuery] = useState(selectedChar?.name ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const deferredQuery = useDeferredValue(query);
  const filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  const debouncedOnType = useDebounce(onType, 300);

  // Sync query when value changes externally — key-based remount handles the initial case
  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const select = useCallback(
    (char: Character) => {
      onChange(char.id);
      setQuery(char.name);
      setIsOpen(false);
      inputRef.current?.blur();
    },
    [onChange]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    debouncedOnType(value);
    if (value === "") {
      onChange("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < filtered.length) {
          select(filtered[highlightIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const showDropdown = isOpen && filtered.length > 0 && query !== selectedChar?.name;

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="block mb-1">
        Character
      </label>

      {/* Input area */}
      <div className="relative flex items-center w-full border rounded-md bg-white has-[input:focus]:ring-2 has-[input:focus]:ring-indigo-500 has-[input:focus]:border-indigo-500">
        {selectedChar && (
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {selectedChar.image && (
              <img
                src={selectedChar.image}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
              />
            )}
            <span className="text-sm font-medium text-gray-700 truncate max-w-28">
              {selectedChar.name}
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={`${id}-listbox`}
          aria-activedescendant={
            highlightIndex >= 0 ? `${id}-option-${highlightIndex}` : undefined
          }
          aria-autocomplete="list"
          value={selectedChar ? "" : query}
          placeholder={selectedChar ? "" : "Search characters..."}
          onChange={handleInputChange}
          onFocus={() => {
            if (query && !selectedChar) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full p-2 bg-transparent outline-none"
        />
        {selectedChar && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear character selection"
            className="cursor-pointer mr-2 p-1 rounded-full hover:bg-gray-200 transition-colors leading-none text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filtered.map((char, index) => (
            <li
              key={char.id}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={char.id === value}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                index === highlightIndex
                  ? "bg-indigo-100"
                  : "hover:bg-gray-100"
              } ${char.id === value ? "font-medium" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                select(char);
              }}
              onMouseEnter={() => setHighlightIndex(index)}
            >
              {char.image && (
                <img
                  src={char.image}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              )}
              <span className="text-sm truncate">{char.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
