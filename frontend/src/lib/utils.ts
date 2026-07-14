export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function avatarUrl(name: string, size = 80): string {
  const encoded = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encoded}&size=${size}&background=0972E1&color=fff&bold=true&format=svg`;
}

export function eventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    webinaire: "Webinaire",
    conference: "Conférence",
    atelier: "Atelier",
    hackathon: "Hackathon",
    meetup: "Meetup",
    formation: "Formation",
    autre: "Autre",
  };
  return labels[type] ?? type;
}

export function eventTypeBadgeVariant(type: string): "blue" | "orange" | "green" | "gray" | "yellow" {
  const variants: Record<string, "blue" | "orange" | "green" | "gray" | "yellow"> = {
    webinaire: "blue",
    conference: "orange",
    atelier: "green",
    hackathon: "orange",
    meetup: "blue",
    formation: "yellow",
    autre: "gray",
  };
  return variants[type] ?? "gray";
}

export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Administrateur",
    president: "Président",
    vp1: "Vice-Président 1",
    vp2: "Vice-Président 2",
    secretaire_general: "Secrétaire Général",
    secretaire_general_adj: "Secrétaire Général Adj.",
    tresorier: "Trésorier",
    tresorier_adj: "Trésorier Adj.",
    responsable_departement: "Resp. Département",
    formateur: "Formateur",
    mentor: "Mentor",
    membre: "Membre",
    candidat: "Candidat",
    visiteur: "Visiteur",
  };
  return labels[role] ?? role;
}

export function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return "Passé";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `Dans ${days}j ${hours}h`;
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `Dans ${hours}h ${minutes}min`;
}
