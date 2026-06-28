import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./api";
import { Category, DeliveryResult, Order, Product } from "@/types";

// --- Public ---

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => api.get("/api/categories/").then((r) => r.data),
  });
}

export function useProducts(categorySlug?: string, featured?: boolean) {
  return useQuery<Product[]>({
    queryKey: ["products", categorySlug, featured],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (categorySlug) params.category = categorySlug;
      if (featured) params.featured = "true";
      return api.get("/api/products/", { params }).then((r) => r.data);
    },
  });
}

export function useProduct(slug: string) {
  return useQuery<Product>({
    queryKey: ["product", slug],
    queryFn: () => api.get(`/api/products/${slug}/`).then((r) => r.data),
    enabled: !!slug,
  });
}

export function useOrder(id: string) {
  return useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => api.get(`/api/orders/${id}/`).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 30000,
  });
}

export function useCalculateDelivery() {
  return useMutation<DeliveryResult, Error, { lat: number; lng: number }>({
    mutationFn: (data) =>
      api.post("/api/delivery/calculate/", data).then((r) => r.data),
  });
}

export function useCreateOrder() {
  return useMutation<
    { id: string; order_number: string; status: string },
    Error,
    Record<string, unknown>
  >({
    mutationFn: (data) =>
      api.post("/api/orders/", data).then((r) => r.data),
  });
}

// --- Admin ---

export function useAdminOrders(status?: string) {
  return useQuery<Order[]>({
    queryKey: ["admin-orders", status],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      return api.get("/api/admin/orders/", { params }).then((r) => r.data);
    },
    refetchInterval: 20000,
  });
}

export function useAdminOrder(id: string) {
  return useQuery<Order>({
    queryKey: ["admin-order", id],
    queryFn: () => api.get(`/api/admin/orders/${id}/`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useAdminUpdateOrderStatus() {
  return useMutation<Order, Error, { id: string; status: string }>({
    mutationFn: ({ id, status }) =>
      api.patch(`/api/admin/orders/${id}/status/`, { status }).then((r) => r.data),
  });
}

export function useAdminProducts() {
  return useQuery<Product[]>({
    queryKey: ["admin-products"],
    queryFn: () => api.get("/api/admin/products/").then((r) => r.data),
  });
}

export function useAdminCreateProduct() {
  return useMutation<Product, Error, FormData>({
    mutationFn: (data) =>
      api.post("/api/admin/products/", data).then((r) => r.data),
  });
}

export function useAdminUpdateProduct() {
  return useMutation<Product, Error, { slug: string; data: FormData }>({
    mutationFn: ({ slug, data }) =>
      api.patch(`/api/admin/products/${slug}/`, data).then((r) => r.data),
  });
}

export function useAdminDeleteProduct() {
  return useMutation<void, Error, string>({
    mutationFn: (slug) =>
      api.delete(`/api/admin/products/${slug}/`).then((r) => r.data),
  });
}

export function useAdminCategories() {
  return useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: () => api.get("/api/admin/categories/").then((r) => r.data),
  });
}

export function useAdminDeliveryZones() {
  return useQuery({
    queryKey: ["admin-delivery-zones"],
    queryFn: () => api.get("/api/admin/delivery-zones/").then((r) => r.data),
  });
}
