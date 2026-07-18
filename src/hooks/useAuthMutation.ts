"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { User, AuthDto } from "@/types";

interface LoginVariables {
  email: string;
  password: string;
  closeActiveSessions?: boolean;
}

export function useAuthMutation() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, LoginVariables>({
    mutationFn: ({ email, password, closeActiveSessions }) =>
      api.auth.login(email, password, closeActiveSessions),
    onSuccess: (user) => {
      // Forzar la invalidación de la query del perfil de usuario
      queryClient.setQueryData(["user", "profile"], user);
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
