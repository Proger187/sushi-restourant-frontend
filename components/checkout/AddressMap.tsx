"use client";

import { Wrapper } from "@googlemaps/react-wrapper";
import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useCalculateDelivery } from "@/lib/queries";
import { DeliveryResult } from "@/types";
import DeliveryInfoPanel from "./DeliveryInfoPanel";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const RESTAURANT_LAT = parseFloat(
  process.env.NEXT_PUBLIC_RESTAURANT_LAT ?? "50.8503"
);
const RESTAURANT_LNG = parseFloat(
  process.env.NEXT_PUBLIC_RESTAURANT_LNG ?? "4.3517"
);

function MapInner({
  onAddressSelect,
}: {
  onAddressSelect: (address: string, lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: RESTAURANT_LAT, lng: RESTAURANT_LNG },
      zoom: 13,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8888aa" }] },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#2a2a4a" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#0e0e2a" }],
        },
      ],
      disableDefaultUI: true,
      zoomControl: true,
    });

    mapInstance.current = map;

    new google.maps.Marker({
      position: { lat: RESTAURANT_LAT, lng: RESTAURANT_LNG },
      map,
      title: "Ресторан",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#E8321A",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    if (inputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(
        inputRef.current,
        { fields: ["geometry", "formatted_address"] }
      );
      autocomplete.bindTo("bounds", map);

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        map.panTo({ lat, lng });
        map.setZoom(15);

        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new google.maps.Marker({
          position: { lat, lng },
          map,
          animation: google.maps.Animation.DROP,
        });

        onAddressSelect(place.formatted_address ?? "", lat, lng);
      });
    }
  }, [onAddressSelect]);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="text"
        placeholder="Введите адрес доставки"
        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
      />
      <div ref={mapRef} className="w-full h-72 rounded-xl overflow-hidden" />
    </div>
  );
}

interface Props {
  onDeliveryResult: (result: DeliveryResult | null) => void;
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  cartSubtotal: number;
}

export default function AddressMap({
  onDeliveryResult,
  onAddressSelect,
  cartSubtotal,
}: Props) {
  const calculateDelivery = useCalculateDelivery();
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(
    null
  );

  const handleAddressSelect = useCallback(
    (address: string, lat: number, lng: number) => {
      onAddressSelect(address, lat, lng);
      calculateDelivery.mutate(
        { lat, lng },
        {
          onSuccess: (result) => {
            setDeliveryResult(result);
            onDeliveryResult(result);
          },
        }
      );
    },
    [calculateDelivery, onAddressSelect, onDeliveryResult]
  );

  if (!API_KEY) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 text-center text-muted">
        <p>Google Maps API key не настроен</p>
        <p className="text-sm mt-1">
          Установите NEXT_PUBLIC_GOOGLE_MAPS_API_KEY в .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Wrapper apiKey={API_KEY} libraries={["places"]}>
        <MapInner onAddressSelect={handleAddressSelect} />
      </Wrapper>

      {calculateDelivery.isPending && (
        <div className="flex items-center gap-2 text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          Рассчитываем доставку...
        </div>
      )}

      {deliveryResult && (
        <DeliveryInfoPanel result={deliveryResult} cartSubtotal={cartSubtotal} />
      )}
    </div>
  );
}
