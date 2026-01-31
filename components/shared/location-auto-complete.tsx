"use client";

import { Input } from "@/components/ui/input";
import { useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

const libraries: "places"[] = ["places"];

interface GoogleAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface GoogleAddressFieldProps {
  value?: string;
  onChange: (address: string) => void;
  onSelectAddress?: (details: GoogleAddress) => void;
}

export default function GoogleAddressField({
  value = "",
  onChange,
  onSelectAddress,
}: GoogleAddressFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<
    { placeId: string; description: string }[]
  >([]);

  const [service, setService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const requestRef = useRef(0);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  useEffect(() => {
    if (isLoaded && window.google) {
      setService(new google.maps.places.AutocompleteService());
    }
  }, [isLoaded]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (!isLoaded || newValue.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const currentRequest = ++requestRef.current;

    try {
      const suggestionApi =
        (window as any)?.google?.maps?.places?.AutocompleteSuggestion;

      if (suggestionApi?.fetchAutocompleteSuggestions) {
        const result = await suggestionApi.fetchAutocompleteSuggestions({
          input: newValue,
        });

        if (currentRequest !== requestRef.current) return;

        const mapped =
          result?.suggestions
            ?.map((item: any) => {
              const prediction = item.placePrediction ?? item;
              const description =
                prediction?.text?.text ??
                prediction?.text ??
                prediction?.description ??
                "";
              return {
                placeId: prediction?.placeId,
                description,
              };
            })
            .filter((item: any) => item.placeId && item.description) ?? [];

        setSuggestions(mapped);
        return;
      }

      if (!service) {
        setSuggestions([]);
        return;
      }

      service.getPlacePredictions({ input: newValue }, (predictions, status) => {
        if (currentRequest !== requestRef.current) return;

        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSuggestions(
            predictions.map((prediction) => ({
              placeId: prediction.place_id,
              description: prediction.description,
            }))
          );
        } else {
          setSuggestions([]);
        }
      });
    } catch {
      setSuggestions([]);
    }
  };

  const handleSelect = (prediction: {
    placeId: string;
    description: string;
  }) => {
    const placeId = prediction.placeId;
    setInputValue(prediction.description);
    setSuggestions([]);

    const detailsService = new google.maps.places.PlacesService(
      document.createElement("div")
    );
    detailsService.getDetails({ placeId }, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        const comps = place.address_components || [];

        const get = (type: string) =>
          comps.find((c) => c.types.includes(type))?.long_name || "";

        const structured = {
          street: `${get("street_number")} ${get("route")}`.trim(),
          city: get("locality") || get("sublocality") || "",
          state: get("administrative_area_level_1") || "",
          zipCode: get("postal_code") || "",
          country: get("country") || "",
        };

        onChange(prediction.description);
        onSelectAddress?.(structured);
      }
    });
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Enter your address"
        value={inputValue}
        onChange={handleInputChange}
        className="bg-transparent border-none outline-none text-base placeholder-white/60"
      />
      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-neutral-900 border border-white/10 rounded-lg mt-2 max-h-52 overflow-auto z-50">
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              className="px-3 py-2 hover:bg-white/10 cursor-pointer"
              onClick={() => handleSelect(s)}>
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
