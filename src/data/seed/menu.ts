import type { Dish, Menu } from "@/domain/menu";
import { cents, type Cents } from "@/domain/money";

const brl = (reais: number): Cents => cents(Math.round(reais * 100));

/** Horários PROVISÓRIOS: o Google só confirma "abre sáb. às 11:00". Confirmar com a loja antes do lançamento. */
export const OPENING_HOURS_ARE_PROVISIONAL = true;

/** Preços cobertos por adesivo no cardápio impresso — aparecem como "Consulte o preço" até o dono informar. */
export const PENDING_PRICE_SLUGS = ["parmegiana-de-tilapia", "parmegiana-de-berinjela"] as const;

type DishInput = Pick<Dish, "slug" | "name"> & Partial<Dish>;
const dish = (d: DishInput): Dish => ({
  basePrice: null,
  variants: [],
  addons: [],
  tags: [],
  isAvailable: true,
  isFeatured: false,
  ...d,
});
const line = (label: string, reais: number) => ({ label, price: brl(reais) });

const ACOMP_PARM = "Acompanha arroz branco ou integral e batata frita, batata palha ou legumes.";
const ACOMP_FEIJAO =
  "Acompanha feijão carioca, preto ou lentilha; arroz branco ou integral; e batata frita ou palha.";

export const seedMenu: Menu = {
  restaurant: {
    name: "Divino Fogão",
    tagline: "Comida da Fazenda · São Leopoldo",
    address: "Bourbon Shopping São Leopoldo · R. Primeiro de Março, 821 · Centro, São Leopoldo/RS",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Divino+Fog%C3%A3o+Bourbon+Shopping+S%C3%A3o+Leopoldo",
    timezone: "America/Sao_Paulo",
    prepTimeMinutes: 20,
    paymentMethods: [
      "Pix",
      "Visa",
      "Mastercard",
      "Elo",
      "Hipercard",
      "American Express",
      "VR",
      "Alelo",
      "Sodexo",
      "Pluxee",
      "Ticket",
      "GreenCard",
      "Aproximação",
    ],
    paymentNotes: ["Não aceitamos Banrisul."],
    notes: ["Todos os pratos acompanham salada de tomate, alface e cenoura."],
  },
  openingHours: [
    ...[1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opensAt: "11:00", closesAt: "22:00" })),
    { weekday: 0, opensAt: "11:00", closesAt: "21:00" },
  ],
  categories: [
    {
      slug: "porcoes-divinas",
      name: "Porções Divinas",
      displayStyle: "rows",
      dishes: [
        dish({
          slug: "pao-de-alho",
          name: "Pão de alho",
          variants: [line("3 unidades", 18.9), line("1 unidade", 6.9)],
        }),
        dish({
          slug: "batata-frita",
          name: "Batata frita",
          variants: [line("Pequena", 29.9), line("Grande", 42.9)],
        }),
        dish({ slug: "polenta-frita", name: "Polenta frita", basePrice: brl(27.9) }),
        dish({
          slug: "ovo-de-codorna-com-oregano",
          name: "Ovo de codorna com orégano",
          basePrice: brl(35.9),
        }),
        dish({
          slug: "tomatinho-cereja",
          name: "Tomatinho cereja",
          description: "Temperado com sal, azeite de oliva e orégano.",
          basePrice: brl(35.9),
        }),
        dish({ slug: "pepino-em-conserva", name: "Pepino em conserva", basePrice: brl(35.9) }),
        dish({ slug: "aneis-de-cebola", name: "Anéis de cebola", basePrice: brl(35.9) }),
        dish({
          slug: "calabresa-grelhada",
          name: "Calabresa grelhada",
          description: "Acebolada.",
          basePrice: brl(35.9),
        }),
        dish({
          slug: "tiras-de-file-de-frango",
          name: "Tiras de filé de frango grelhado",
          description: "Aceboladas.",
          basePrice: brl(35.9),
        }),
        dish({
          slug: "tiras-de-alcatra",
          name: "Tiras de alcatra grelhada",
          description: "Aceboladas.",
          basePrice: brl(51.9),
        }),
      ],
    },
    {
      slug: "para-compartilhar",
      name: "Para Compartilhar",
      displayStyle: "rows",
      dishes: [
        dish({
          slug: "porcao-dupla",
          name: "Porção dupla",
          description:
            "Escolha 2 opções diferentes: batata frita, polenta frita, pão de alho, ovo de codorna, pepino em conserva, calabresa acebolada, iscas de frango aceboladas, iscas de alcatra aceboladas, tomatinho cereja ou anéis de cebola.",
          basePrice: brl(39.9),
          addons: [line("Opção com alcatra", 5)],
        }),
        dish({
          slug: "batata-frita-com-calabresa",
          name: "Batata frita com calabresa",
          basePrice: brl(39),
          addons: [line("Opção com alcatra", 5), line("Farofinha", 5), line("Cebolado extra", 5)],
          photo: {
            src: "/menu-photos/batata-com-calabresa.jpg",
            alt: "Porção de batata frita com calabresa",
          },
          isFeatured: true,
        }),
        dish({
          slug: "divina-porcao",
          name: "Divina Porção",
          description:
            "Batata frita, pão de alho, iscas de alcatra, iscas de frango, calabresa acebolada, tomatinho cereja, ovinho de codorna com orégano, pepino e queijo coalho.",
          basePrice: brl(89.9),
          serves: 3,
          isFeatured: true,
        }),
        dish({
          slug: "batatao-divino",
          name: "Batatão Divino",
          description:
            "Escolha os recheios: cheddar, barbecue, calabresa ou muçarela; estrogonofe de frango com batata palha; ou estrogonofe de carne com batata palha. Ganhe 1 chopp 400 ml.",
          basePrice: brl(89.9),
          serves: 3,
          photo: {
            src: "/menu-photos/batatao.jpg",
            alt: "Batatão Divino coberto de cheddar, servido com chopp",
          },
          isFeatured: true,
        }),
      ],
    },
    {
      slug: "parmegianas",
      name: "Parmegianas",
      displayStyle: "rows",
      dishes: [
        dish({
          slug: "parmegiana-de-frango",
          name: "Parmegiana de frango",
          description: `Molho artesanal. ${ACOMP_PARM}`,
          basePrice: brl(45.9),
          isFeatured: true,
        }),
        dish({
          slug: "parmegiana-de-tilapia",
          name: "Parmegiana de tilápia",
          description: `Molho artesanal. ${ACOMP_PARM}`,
        }),
        dish({
          slug: "parmegiana-de-alcatra",
          name: "Parmegiana de alcatra",
          description: `Molho artesanal. ${ACOMP_PARM}`,
          basePrice: brl(47.9),
        }),
        dish({
          slug: "parmegiana-de-berinjela",
          name: "Parmegiana de berinjela",
          description: `Molho artesanal. ${ACOMP_PARM}`,
          tags: ["vegetariano"],
        }),
      ],
    },
    {
      slug: "pratos-com-frango",
      name: "Frango",
      displayStyle: "rows",
      dishes: [
        dish({
          slug: "file-de-frango-grelhado",
          name: "Filé de frango grelhado",
          description: ACOMP_FEIJAO,
          basePrice: brl(39.9),
          addons: [line("À milanesa", 3)],
        }),
        dish({
          slug: "estrogonofe-de-frango",
          name: "Estrogonofe de frango",
          description: ACOMP_PARM,
          basePrice: brl(41.9),
        }),
        dish({
          slug: "file-de-frango-com-legumes",
          name: "Filé de frango com legumes",
          description: "Acompanha feijão carioca, preto ou lentilha e arroz branco ou integral.",
          basePrice: brl(39.9),
        }),
      ],
    },
    {
      slug: "carnes-e-peixe",
      name: "Carnes e Peixe",
      displayStyle: "rows",
      dishes: [
        dish({
          slug: "alcatra-a-cavalo",
          name: "Alcatra à cavalo à la minuta",
          description: `Com ovo frito. ${ACOMP_FEIJAO}`,
          basePrice: brl(45.9),
        }),
        dish({
          slug: "alcatra-grelhada",
          name: "Alcatra grelhada",
          description: ACOMP_FEIJAO,
          basePrice: brl(43.9),
        }),
        dish({
          slug: "tilapia-grelhada",
          name: "Tilápia grelhada",
          description: ACOMP_PARM,
          basePrice: brl(47.9),
          addons: [line("À milanesa", 3)],
        }),
      ],
    },
    {
      slug: "extras",
      name: "Extras",
      displayStyle: "compact",
      dishes: [
        dish({ slug: "arroz-branco", name: "Arroz branco", basePrice: brl(9.9) }),
        dish({ slug: "arroz-integral", name: "Arroz integral", basePrice: brl(11.9) }),
        dish({
          slug: "batata-frita-na-caixinha",
          name: "Batata frita na caixinha",
          basePrice: brl(11.9),
        }),
        dish({ slug: "alcatra-extra", name: "Alcatra (100–120 g)", basePrice: brl(15.9) }),
        dish({ slug: "ovo-frito", name: "Ovo frito (1 unidade)", basePrice: brl(3.9) }),
        dish({
          slug: "polenta-frita-pequena",
          name: "Polenta frita (pequena)",
          basePrice: brl(11.9),
        }),
        dish({ slug: "legumes", name: "Legumes", basePrice: brl(11.9) }),
        dish({ slug: "feijao-carioca", name: "Feijão carioca", basePrice: brl(11.9) }),
        dish({ slug: "feijao-preto", name: "Feijão preto", basePrice: brl(11.9) }),
        dish({ slug: "lentilha", name: "Lentilha", basePrice: brl(13.9) }),
        dish({
          slug: "file-de-frango-extra",
          name: "Filé de frango (100–120 g)",
          basePrice: brl(13.9),
        }),
        dish({ slug: "pure-de-batata", name: "Purê de batata", basePrice: brl(11.9) }),
        dish({
          slug: "tilapia-extra",
          name: "Tilápia grelhada (100–120 g)",
          basePrice: brl(17.9),
        }),
        dish({ slug: "maionese", name: "Maionese (300 g)", basePrice: brl(13.9) }),
      ],
    },
    {
      slug: "sobremesas",
      name: "Sobremesas",
      displayStyle: "compact",
      dishes: [
        dish({ slug: "mousse-de-maracuja", name: "Mousse de maracujá", basePrice: brl(9.9) }),
        dish({ slug: "mousse-de-limao", name: "Mousse de limão", basePrice: brl(9.9) }),
        dish({ slug: "fatia-de-pudim", name: "Fatia de pudim", basePrice: brl(9.9) }),
      ],
    },
    {
      slug: "bebidas",
      name: "Bebidas",
      displayStyle: "compact",
      dishes: [
        dish({
          slug: "refrigerante",
          name: "Refrigerante",
          variants: [line("Lata", 9.5), line("600 ml", 13.5)],
        }),
        dish({ slug: "suco-del-valle", name: "Suco Del Valle (lata)", basePrice: brl(9.5) }),
        dish({ slug: "agua-tonica", name: "Água tônica", basePrice: brl(9.5) }),
        dish({ slug: "schweppes-citrus", name: "Schweppes Citrus", basePrice: brl(9.5) }),
        dish({ slug: "cha-gelado", name: "Chá gelado (copo)", basePrice: brl(9.9) }),
        dish({ slug: "agua-mineral", name: "Água mineral 500 ml", basePrice: brl(7.5) }),
        dish({
          slug: "suco-de-laranja",
          name: "Suco de laranja natural",
          variants: [line("200 ml", 9), line("300 ml", 11), line("500 ml", 13)],
        }),
      ],
    },
    {
      slug: "cervejas-e-drinks",
      name: "Cervejas e Drinks",
      displayStyle: "compact",
      dishes: [
        dish({ slug: "chopp", name: "Chopp", variants: [line("400 ml", 19), line("770 ml", 29)] }),
        dish({ slug: "cerveja-long-neck", name: "Cerveja long neck", basePrice: brl(15) }),
        dish({ slug: "cerveja-lata", name: "Cerveja lata", basePrice: brl(11) }),
        dish({ slug: "cerveja-latao", name: "Cerveja latão 473 ml", basePrice: brl(16) }),
        dish({ slug: "caipirinha-de-cachaca", name: "Caipirinha de cachaça", basePrice: brl(25) }),
        dish({ slug: "caipirinha-de-vodka", name: "Caipirinha de vodka", basePrice: brl(29) }),
        dish({ slug: "cachaca-mineira", name: "Cachaça mineira (dose)", basePrice: brl(11) }),
        dish({ slug: "whisky-importado", name: "Whisky importado (dose)", basePrice: brl(19) }),
      ],
    },
  ],
  promotions: [
    {
      slug: "prato-mais-bebida",
      title: "Prato + bebida",
      description:
        "Na compra de qualquer prato, leve um refrigerante lata ou uma água mineral 500 ml.",
      highlight: "+ R$ 5,90",
    },
    {
      slug: "tres-chopps-com-fritas",
      title: "3 chopps + fritas",
      description:
        "Na compra de 3 chopps 400 ml, acrescente R$ 2,00 e ganhe uma mini porção de batata frita.",
      highlight: "+ R$ 2,00",
    },
    {
      slug: "caipirinha-com-long-neck",
      title: "Caipirinha + long neck",
      description:
        "Na compra de uma caipirinha, ganhe 1 cerveja long neck (Stella Artois ou Budweiser).",
      highlight: "Long neck grátis",
    },
    {
      slug: "sobremesa-terceira-gratis",
      title: "Sobremesas",
      description: "Na compra de duas sobremesas, a terceira é grátis.",
      highlight: "3ª grátis",
    },
  ],
};
