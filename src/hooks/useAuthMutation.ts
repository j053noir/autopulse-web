"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { User, AuthDto } from "@/types";

interface LoginVariables {
  email: string;
  password: string;
  closeActiveSessions?: boolean;
}

interface LoginResponse {
  user: User;
  auth: AuthDto;
}

export function useAuthMutation() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginVariables>({
    mutationFn: ({ email, password, closeActiveSessions }) =>
      api.auth.login(email, password, closeActiveSessions),
    onSuccess: (data) => {
      // Almacenar tokens y datos de usuario en almacenamiento persistente
      localStorage.setItem("accessToken", data.auth.accessToken);
      localStorage.setItem("refreshToken", data.auth.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Forzar la invalidación de la query del perfil de usuario
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
