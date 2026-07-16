"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { setAccessToken, setRefreshToken, getRefreshToken } from "@/lib/axios";
import type { LoginPayload, RegisterPayload } from "@/types/auth.types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => authService.me().then((r) => r.data),
    retry: false,
    staleTime: 1000 * 60 * 5,
    // Tant que le compte n'est pas vérifié, on repasse en arrière-plan pour détecter
    // une vérification faite depuis un autre onglet (cas le plus courant : lien
    // ouvert depuis l'email) sans que l'utilisateur ait à rafraîchir manuellement.
    // refetchIntervalInBackground : sans ça, le polling se met en pause dès que cet
    // onglet n'est plus au premier plan (ex: on part cliquer le lien dans un autre
    // onglet/appli) — refetchOnWindowFocus étant désactivé globalement, revenir sur
    // l'onglet ne redéclenchait pas non plus de vérification.
    refetchInterval: (query) => (query.state.data && !query.state.data.email_verified ? 8000 : false),
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: (query) => !query.state.data?.email_verified,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data).then((r) => r.data),
    onSuccess: (data) => {
      // Store both tokens
      setAccessToken(data.access);
      setRefreshToken(data.refresh);
      qc.setQueryData(["me"], data.user);
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          await authService.logout(refresh);
        } catch {
          // ignore logout API errors — clean up anyway
        }
      }
    },
    onSettled: () => {
      setAccessToken(null);
      setRefreshToken(null);
      qc.clear();
      // Hard navigation ensures proxy sees cleared cookies immediately
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data).then((r) => r.data),
    onSuccess: () => {
      router.push("/login?registered=1");
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => authService.deleteAccount(password),
    onSuccess: () => {
      setAccessToken(null);
      setRefreshToken(null);
      qc.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    },
  });
}

