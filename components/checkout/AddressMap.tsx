"use client";

import { Wrapper } from "@googlemaps/react-wrapper";
import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCalculateDelivery, useRestaurantSettings } from "@/lib/queries";
import { DeliveryResult } from "@/types";
import DeliveryInfoPanel from "./DeliveryInfoPanel";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8888aa" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a4a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e2a" }] },
];

function MapInner({
  onAddressSelect,
  restaurantLat,
  restaurantLng,
  deliveryAvailable,
  customerLat,
  customerLng,
}: {
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  restaurantLat: number;
  restaurantLng: number;
  deliveryAvailable: boolean | null;
  customerLat: number | null;
  customerLng: number | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const customerMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("checkout");

  useEffect(() => {
    if (!mapRef.current) return;
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: restaurantLat, lng: restaurantLng },
      zoom: 13,
      styles: DARK_MAP_STYLES,
      disableDefaultUI: true,
      zoomControl: true,
    });
    mapInstance.current = map;

    new google.maps.Marker({
      position: { lat: restaurantLat, lng: restaurantLng },
      map,
      title: "Restaurant",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#E8321A",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });

    new google.maps.Circle({
      center: { lat: restaurantLat, lng: restaurantLng },
      radius: 200,
      map,
      fillColor: "#E8321A",
      fillOpacity: 0.15,
      strokeColor: "#E8321A",
      strokeOpacity: 0.3,
      strokeWeight: 1,
    });

    if (inputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ["geometry", "formatted_address"],
      });
      autocomplete.bindTo("bounds", map);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onAddressSelect(place.formatted_address ?? "", lat, lng);
      });
    }
  }, [onAddressSelect, restaurantLat, restaurantLng, t]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || customerLat == null || customerLng == null) return;

    if (customerMarkerRef.current) customerMarkerRef.current.setMap(null);
    customerMarkerRef.current = new google.maps.Marker({
      position: { lat: customerLat, lng: customerLng },
      map,
      animation: google.maps.Animation.DROP,
    });

    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    if (deliveryAvailable) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: restaurantLat, lng: restaurantLng },
          destination: { lat: customerLat, lng: customerLng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            const renderer = new google.maps.DirectionsRenderer({
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#E8321A",
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
            });
            renderer.setMap(map);
            renderer.setDirections(result);
            directionsRendererRef.current = renderer;

            if (result.routes[0]?.bounds) {
              map.fitBounds(result.routes[0].bounds, {
                top: 60,
                right: 60,
                bottom: 60,
                left: 60,
              });
            }
          } else {
            const bounds = new google.maps.LatLngBounds();
            bounds.extend({ lat: restaurantLat, lng: restaurantLng });
            bounds.extend({ lat: customerLat!, lng: customerLng! });
            map.fitBounds(bounds, 60);
          }
        }
      );
    } else {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: restaurantLat, lng: restaurantLng });
      bounds.extend({ lat: customerLat, lng: customerLng });
      map.fitBounds(bounds, 60);
    }
  }, [deliveryAvailable, customerLat, customerLng, restaurantLat, restaurantLng]);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="text"
        placeholder={t("enter_address")}
        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
      />
      <div ref={mapRef} className="w-full h-80 rounded-xl overflow-hidden" />
    </div>
  );
}

interface Props {
  onDeliveryResult: (result: DeliveryResult | null) => void;
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  cartSubtotal: number;
}

export default function AddressMap({ onDeliveryResult, onAddressSelect, cartSubtotal }: Props) {
  const t = useTranslations("checkout");
  const { data: restaurantSettings, isLoading: settingsLoading } = useRestaurantSettings();
  const calculateDelivery = useCalculateDelivery();
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(null);
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleAddressSelect = useCallback(
    (address: string, lat: number, lng: number) => {
      setCustomerCoords({ lat, lng });
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
        <p>{t("no_maps_key")}</p>
        <p className="text-sm mt-1">{t("no_maps_hint")}</p>
      </div>
    );
  }

  if (settingsLoading) {
    return (
      <div className="h-80 bg-surface border border-border rounded-xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  const rLat = restaurantSettings?.latitude ?? parseFloat(process.env.NEXT_PUBLIC_RESTAURANT_LAT ?? "51.1279");
  const rLng = restaurantSettings?.longitude ?? parseFloat(process.env.NEXT_PUBLIC_RESTAURANT_LNG ?? "71.4304");

  return (
    <div className="space-y-4">
      <Wrapper apiKey={API_KEY} libraries={["places", "routes"]}>
        <MapInner
          onAddressSelect={handleAddressSelect}
          restaurantLat={rLat}
          restaurantLng={rLng}
          deliveryAvailable={deliveryResult?.available ?? null}
          customerLat={customerCoords?.lat ?? null}
          customerLng={customerCoords?.lng ?? null}
        />
      </Wrapper>
      {calculateDelivery.isPending && (
        <div className="flex items-center gap-2 text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t("calculating")}
        </div>
      )}
      {deliveryResult && (
        <DeliveryInfoPanel result={deliveryResult} cartSubtotal={cartSubtotal} />
      )}
    </div>
  );
}
