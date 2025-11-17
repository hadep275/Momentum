import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin } from "lucide-react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const AddressAutocomplete = ({ value, onChange, placeholder, id }: AddressAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch address suggestions from Nominatim (OpenStreetMap)
  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}` +
        `&format=json` +
        `&addressdetails=1` +
        `&limit=5`,
        {
          headers: {
            'User-Agent': 'Momentum App' // Required by Nominatim
          }
        }
      );

      if (response.ok) {
        const data: NominatimResult[] = await response.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      }
    } catch (error) {
      console.error('Failed to fetch address suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300); // Wait 300ms after user stops typing
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSelect = (address: string) => {
    onChange(address);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            id={id}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder || "Start typing an address..."}
            className="pr-8"
          />
          <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandList>
            {loading && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Searching addresses...
              </div>
            )}
            {!loading && suggestions.length === 0 && value.length >= 3 && (
              <CommandEmpty>No addresses found.</CommandEmpty>
            )}
            {!loading && suggestions.length > 0 && (
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.place_id}
                    value={suggestion.display_name}
                    onSelect={() => handleSelect(suggestion.display_name)}
                    className="cursor-pointer"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    <span className="text-sm">{suggestion.display_name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

