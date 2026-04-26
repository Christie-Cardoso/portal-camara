export const CURRENT_YEAR = 2026;
export const COMPARISON_YEARS = [2023, 2024, 2025, 2026];

export const TOP_15_DEPUTADOS = [
  { id: 209787, nome: "Nikolas Ferreira", partido: "PL", uf: "MG", votos: 1492047, rank: 1 },
  { id: 204534, nome: "Tabata Amaral", partido: "PSB", uf: "SP", votos: 243037, rank: 2 },
  { id: 160976, nome: "Tiririca", partido: "PL", uf: "SP", votos: 222036, rank: 3 },
  { id: 74646, nome: "Aécio Neves", partido: "PSDB", uf: "MG", votos: 85341, rank: 4 },
  { id: 220645, nome: "Erika Hilton", partido: "PSOL", uf: "SP", votos: 256903, rank: 5 },
  { id: 204536, nome: "Kim Kataguiri", partido: "UNIÃO", uf: "SP", votos: 295460, rank: 6 },
  { id: 204515, nome: "André Janones", partido: "AVANTE", uf: "MG", votos: 238967, rank: 7 },
  { id: 204374, nome: "Bia Kicis", partido: "PL", uf: "DF", votos: 214733, rank: 8 },
  { id: 107283, nome: "Gleisi Hoffmann", partido: "PT", uf: "PR", votos: 261247, rank: 9 },
  { id: 156190, nome: "Marcel van Hattem", partido: "NOVO", uf: "RS", votos: 226816, rank: 10 },
  { id: 204535, nome: "Sâmia Bomfim", partido: "PSOL", uf: "SP", votos: 226187, rank: 11 },
  { id: 220623, nome: "Duda Salabert", partido: "PDT", uf: "MG", votos: 222985, rank: 12 },
  { id: 74398, nome: "Maria do Rosário", partido: "PT", uf: "RS", votos: 151057, rank: 13 },
  { id: 178947, nome: "Sóstenes Cavalcante", partido: "PL", uf: "RJ", votos: 154733, rank: 14 },
  { id: 160592, nome: "Zeca Dirceu", partido: "PT", uf: "PR", votos: 123033, rank: 15 },
].sort((a, b) => b.votos - a.votos);
