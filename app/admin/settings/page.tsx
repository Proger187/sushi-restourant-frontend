"use client";

import { useEffect, useRef, useState } from "react";
import { Save, Loader2, MapPin } from "lucide-react";
import { Wrapper } from "@googlemaps/react-wrapper";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

function LocationPicker({
  lat,
  lng,
  onLocationChange,
  searchPlaceholder,
  mapHint,
}: {
  lat: number;
  lng: number;
  onLocationChange: (address: string, lat: number, lng: number) => void;
  searchPlaceholder: string;
  mapHint: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  const placeMarker = (position: google.maps.LatLng | google.maps.LatLngLiteral) => {
    if (markerRef.current) markerRef.current.setMap(null);
    const map = mapInstance.current!;
    markerRef.current = new google.maps.Marker({
      position,
      map,
      draggable: true,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#E8321A",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
    });
    markerRef.current.addListener("dragend", () => {
      const pos = markerRef.current!.getPosition()!;
      reverseGeocode(pos.lat(), pos.lng());
    });
  };

  const reverseGeocode = (newLat: number, newLng: number) => {
    if (!geocoder.current) geocoder.current = new google.maps.Geocoder();
    geocoder.current.geocode(
      { location: { lat: newLat, lng: newLng } },
      (results, status) => {
        const addr = status === "OK" && results?.[0] ? results[0].formatted_address : "";
        onLocationChange(addr, newLat, newLng);
      }
    );
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8888aa" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a4a" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e2a" }] },
      ],
      disableDefaultUI: true,
      zoomControl: true,
    });
    mapInstance.current = map;

    placeMarker({ lat, lng });

    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const clickLat = e.latLng.lat();
      const clickLng = e.latLng.lng();
      placeMarker(e.latLng);
      map.panTo(e.latLng);
      reverseGeocode(clickLat, clickLng);
    });

    if (inputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ["geometry", "formatted_address"],
      });
      autocomplete.bindTo("bounds", map);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();
        map.panTo({ lat: newLat, lng: newLng });
        map.setZoom(16);
        placeMarker({ lat: newLat, lng: newLng });
        onLocationChange(place.formatted_address ?? "", newLat, newLng);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          ref={inputRef}
          type="text"
          placeholder={searchPlaceholder}
          className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>
      <div ref={mapRef} className="w-full h-80 rounded-xl overflow-hidden" />
      <p className="text-xs text-muted">{mapHint}</p>
    </div>
  );
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const t = useTranslations("admin");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  useEffect(() => {
    api
      .get("/api/admin/restaurant-settings/")
      .then(({ data }) => {
        setName(data.name);
        setPhone(data.phone ?? "");
        setEmail(data.email ?? "");
        setWorkingHours(data.working_hours ?? "");
        setAddress(data.address ?? "");
        setLatitude(data.latitude);
        setLongitude(data.longitude);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLocationChange = (addr: string, lat: number, lng: number) => {
    setAddress(addr);
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/api/admin/restaurant-settings/", {
        name, phone, email,
        working_hours: workingHours,
        address, latitude, longitude,
      });
      queryClient.invalidateQueries({ queryKey: ["restaurant-settings"] });
      toast.success(t("settings_saved"));
    } catch {
      toast.error(t("settings_failed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t("settings_title")}</h1>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">{t("restaurant_info")}</h2>
        <div>
          <label className="block text-sm text-muted mb-1">{t("name_label")}</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">{t("phone")}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">{t("email")}</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">{t("working_hours")}</label>
          <textarea value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} rows={3}
            placeholder={"Mon-Fri: 11:00–22:00\nSat-Sun: 12:00–22:00"}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none" />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">{t("location_title")}</h2>

        {API_KEY ? (
          <Wrapper apiKey={API_KEY} libraries={["places"]}>
            <LocationPicker lat={latitude} lng={longitude} onLocationChange={handleLocationChange} searchPlaceholder={t("search_address")} mapHint={t("map_hint")} />
          </Wrapper>
        ) : (
          <p className="text-muted text-sm">{t("no_maps_key")}</p>
        )}

        <div>
          <label className="block text-sm text-muted mb-1">{t("address")}</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted mb-1">{t("latitude")}</label>
            <input type="number" step="any" value={latitude} readOnly
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-muted focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">{t("longitude")}</label>
            <input type="number" step="any" value={longitude} readOnly
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-muted focus:outline-none" />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {t("save_settings")}
      </button>
    </div>
  );
}
