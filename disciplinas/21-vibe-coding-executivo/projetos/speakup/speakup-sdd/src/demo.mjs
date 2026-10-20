import { COLUMNS } from "./domain.mjs";
export function seed() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(9, 0, 0, 0);
  const slots = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + Math.floor(i / 2));
    d.setHours(i % 2 ? 14 : 9);
    slots.push({
      id: i + 1,
      teacher: i % 2 ? "James Wilson" : "Camila Rocha",
      group: i % 2 ? "Business English · B1" : "English Foundations · A2",
      start: d.toISOString(),
      end: new Date(+d + 3600000).toISOString(),
      capacity: 5,
    });
  }
  const students = [
    "Beatriz Costa",
    "Lucas Almeida",
    "Ana Souza",
    "Pedro Santos",
    "Mariana Lima",
    "Rafael Oliveira",
  ].map((nome, i) => ({
    ...Object.fromEntries(COLUMNS.map((c) => [c, ""])),
    id_aluno: String(10045 + i),
    nome,
    email: `aluno${i + 1}@example.com`,
    data_nascimento: "1993-06-15",
    idade: "33",
    genero: "",
    unidade: i % 2 ? "TechNova" : "Acme Brasil",
    cidade: "São Paulo",
    estado: "SP",
    canal_aquisicao: "B2B",
    nivel_curso: i % 2 ? "B1" : "A2",
    modalidade: "Online",
    turno: "Manhã",
    plano: "Anual",
    desconto_percentual: "0",
    data_matricula: "2026-01-10",
    status_matricula: "Ativa",
    "Valor Mensalidade": "450.00",
  }));
  return {
    students,
    slots,
    bookings: [
      {
        id: 1,
        student: "10045",
        slot: 1,
        status: "agendada",
        attendance: null,
      },
      {
        id: 2,
        student: "10046",
        slot: 2,
        status: "agendada",
        attendance: "Presente",
      },
      {
        id: 3,
        student: "10047",
        slot: 1,
        status: "agendada",
        attendance: "Falta justificada",
      },
      {
        id: 4,
        student: "10048",
        slot: 2,
        status: "agendada",
        attendance: "Presente",
      },
    ],
    audit: [],
  };
}
