"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Info } from "lucide-react";
import { useAdminDeliveryZones } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface DeliveryZone {
  id: string;
  name: string;
  max_km: number;
  delivery_fee: string;
  min_order_amount: string;
  is_active: boolean;
}

export default function AdminDeliveryPage() {
  const { data: zones = [] } = useAdminDeliveryZones() as {
    data: DeliveryZone[] | undefined;
  };
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editZone, setEditZone] = useState<DeliveryZone | null>(null);

  const [name, setName] = useState("");
  const [maxKm, setMaxKm] = useState("");
  const [fee, setFee] = useState("");
  const [minOrder, setMinOrder] = useState("");

  const openCreate = () => {
    setEditZone(null);
    setName("");
    setMaxKm("");
    setFee("");
    setMinOrder("");
    setShowForm(true);
  };

  const openEdit = (zone: DeliveryZone) => {
    setEditZone(zone);
    setName(zone.name);
    setMaxKm(zone.max_km.toString());
    setFee(zone.delivery_fee);
    setMinOrder(zone.min_order_amount);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      max_km: parseFloat(maxKm),
      delivery_fee: fee,
      min_order_amount: minOrder,
    };

    if (editZone) {
      await api.patch(`/api/admin/delivery-zones/${editZone.id}/`, payload);
    } else {
      await api.post("/api/admin/delivery-zones/", payload);
    }
    queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить зону?")) return;
    await api.delete(`/api/admin/delivery-zones/${id}/`);
    queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
  };

  const handleToggleActive = async (zone: DeliveryZone) => {
    await api.patch(`/api/admin/delivery-zones/${zone.id}/`, {
      is_active: !zone.is_active,
    });
    queryClient.invalidateQueries({ queryKey: ["admin-delivery-zones"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Зоны доставки</h1>
        <button
          onClick={openCreate}
          className="bg-accent hover:bg-accent/90 text-white text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="px-4 py-3 font-medium">Зона</th>
                <th className="px-4 py-3 font-medium">Макс. км</th>
                <th className="px-4 py-3 font-medium">Стоимость</th>
                <th className="px-4 py-3 font-medium">Мин. заказ</th>
                <th className="px-4 py-3 font-medium text-center">Активна</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr
                  key={zone.id}
                  className="border-b border-border/50 hover:bg-background/50"
                >
                  <td className="px-4 py-3 font-medium">{zone.name}</td>
                  <td className="px-4 py-3">{zone.max_km} км</td>
                  <td className="px-4 py-3">
                    {parseFloat(zone.delivery_fee) === 0
                      ? "Бесплатно"
                      : formatPrice(zone.delivery_fee)}
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(zone.min_order_amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(zone)}
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        zone.is_active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {zone.is_active ? "Да" : "Нет"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => openEdit(zone)}
                        className="p-1.5 text-muted hover:text-white"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(zone.id)}
                        className="p-1.5 text-muted hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {zones.length === 0 && (
            <p className="text-center text-muted py-8">Зон пока нет</p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 text-sm text-muted">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Координаты ресторана настраиваются в переменных окружения
          (RESTAURANT_LAT, RESTAURANT_LNG)
        </p>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-surface border border-border rounded-2xl w-full max-w-sm p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold">
              {editZone ? "Редактировать" : "Новая зона"}
            </h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название зоны"
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              step="0.1"
              value={maxKm}
              onChange={(e) => setMaxKm(e.target.value)}
              placeholder="Макс. расстояние (км)"
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="Стоимость доставки"
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
            <input
              type="number"
              step="0.01"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="Минимальный заказ"
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-border text-muted py-2.5 rounded-xl text-sm"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 bg-accent text-white py-2.5 rounded-xl text-sm font-medium"
              >
                {editZone ? "Сохранить" : "Создать"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
