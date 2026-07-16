// Pays africains en premier (cœur de la communauté DAH), puis le reste du monde
// (diaspora), chaque groupe trié alphabétiquement.
export const AFRICAN_COUNTRIES = [
  "Afrique du Sud", "Algérie", "Angola", "Bénin", "Botswana", "Burkina Faso",
  "Burundi", "Cabo Verde", "Cameroun", "Comores", "Congo-Brazzaville",
  "Côte d'Ivoire", "Djibouti", "Égypte", "Érythrée", "Eswatini", "Éthiopie",
  "Gabon", "Gambie", "Ghana", "Guinée", "Guinée-Bissau", "Guinée équatoriale",
  "Kenya", "Lesotho", "Liberia", "Libye", "Madagascar", "Malawi", "Mali",
  "Maroc", "Maurice", "Mauritanie", "Mozambique", "Namibie", "Niger",
  "Nigéria", "Ouganda", "République centrafricaine", "République démocratique du Congo",
  "Rwanda", "Sao Tomé-et-Principe", "Sénégal", "Seychelles", "Sierra Leone",
  "Somalie", "Soudan", "Soudan du Sud", "Tanzanie", "Tchad", "Togo",
  "Tunisie", "Zambie", "Zimbabwe",
] as const;

export const OTHER_COUNTRIES = [
  "Allemagne", "Arabie Saoudite", "Australie", "Belgique", "Brésil", "Canada",
  "Chine", "Corée du Sud", "Émirats Arabes Unis", "Espagne", "États-Unis",
  "France", "Inde", "Italie", "Japon", "Liban", "Pays-Bas", "Portugal",
  "Qatar", "Royaume-Uni", "Suisse", "Turquie", "Autre",
] as const;

export const ALL_COUNTRIES = [...AFRICAN_COUNTRIES, ...OTHER_COUNTRIES];
