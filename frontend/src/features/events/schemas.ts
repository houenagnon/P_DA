import { z } from "zod";

export const eventRegistrationSchema = z.object({
  email: z.string().email("Email invalide"),
  first_name: z.string().min(2, "Prénom requis"),
  last_name: z.string().min(2, "Nom requis"),
  nationality: z.string().min(2, "Nationalité requise"),
  organisation: z.string().min(1, "Organisation requise"),
  profession: z.string().min(1, "Profession requise"),
  motivation: z.string().min(1, "Merci d'indiquer la raison de votre inscription"),
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
