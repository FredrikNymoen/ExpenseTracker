export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
  }).format(amount);

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getRiskBadgeColor = (score: string) => {
  if (score === "low") return "green.300";
  if (score === "medium") return "yellow.300";
  return "red.300";
};
