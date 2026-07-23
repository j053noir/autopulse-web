"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { AuthDto } from "@/types";

interface LoginVariables {
  email: string;
  password: string;
  closeActiveSessions?: boolean;
}

export function useAuthMutation() {
  const queryClient = useQueryClient();

  return useMutation<AuthDto, Error, LoginVariables>({
    mutationFn: ({ email, password, closeActiveSessions }) =>
      api.auth.login(email, password, closeActiveSessions),
    onSuccess: () => {
      // Forzar la invalidación de la query del perfil de usuario
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
