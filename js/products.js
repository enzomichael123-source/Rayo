// ===== IMAGENS DA LOJA =====
// Estes arquivos ainda NÃO existem: coloque suas fotos em img/ com estes nomes (ou troque os caminhos).
// Enquanto o arquivo não existir, a loja mostra um quadro bege "Foto de demonstração".
// pos = parte da foto que fica visível no corte ("center", "top", "left", "50% 20%"...).
const IMAGENS = {
  hero:    { src: "img/hero.jpg", alt: "Mulher com vestido marcante em ambiente de luz natural", pos: "center" },
  inverno: { src: "img/colecao-inverno.jpg", alt: "Vestido longo de veludo em ambiente aconchegante", pos: "center" },
  verao:   { src: "img/colecao-verao.jpg", alt: "Vestido curto leve em um dia ensolarado", pos: "center" }
};
// ===== PRODUTOS (fictícios) =====
// nome, coleção (inverno|verao), preço, preço antigo (0 = sem promoção), popularidade, novidade (1/0), disponível (1/0), tamanhos, foto, texto alt, descrição
const S = ["P", "M", "G"];
const ROWS = [
  ["Vestido Cetim Decote Drapeado", "verao", 249.9, 0, 95, 1, 1, S, "vestido-cetim-drapeado.jpg", "Vestido curto de cetim com decote drapeado e alças finas", "Minivestido de cetim com caimento fluido, decote drapeado e alças finas."],
  ["Vestido Broderie Amarração", "verao", 229.9, 289.9, 88, 1, 1, S, "vestido-broderie-amarracao.jpg", "Vestido curto de broderie com laço frontal e decote em V", "Tecido bordado vazado, decote em V e fita de amarração na frente."],
  ["Vestido Longo Transparente Poá", "verao", 319.9, 0, 80, 1, 1, S, "vestido-longo-poa.jpg", "Vestido longo transparente com estampa de poás e mangas sino", "Tule leve com poás grandes e mangas sino, para usar sobre body ou biquíni."],
  ["Vestido Tomara que Caia com Fenda", "verao", 269.9, 0, 70, 0, 1, S, "vestido-tomara-fenda.jpg", "Vestido longo tomara que caia com fenda lateral", "Modelagem ajustada, fenda lateral e acabamento marcante."],
  ["Vestido Franjas Dourado Fosco", "verao", 349.9, 429.9, 60, 0, 1, S, "vestido-franjas-dourado.jpg", "Vestido curto com franjas em tom dourado fosco", "Franjas que acompanham o movimento, para noites especiais."],
  ["Vestido Costas Nuas Rosé", "verao", 239.9, 0, 65, 0, 0, S, "vestido-costas-nuas-rose.jpg", "Vestido rosé com decote nas costas", "Frente discreta e costas abertas com amarração."],
  ["Vestido Veludo Ombro Único", "inverno", 359.9, 0, 82, 1, 1, S, "vestido-veludo-ombro-unico.jpg", "Vestido de veludo com ombro único", "Veludo macio com um ombro só e caimento elegante."],
  ["Vestido Tricô Justo com Fenda", "inverno", 279.9, 349.9, 74, 0, 1, S, "vestido-trico-fenda.jpg", "Vestido longo de tricô justo com fenda", "Tricô elástico que acompanha o corpo, com fenda frontal."],
  ["Vestido Cetim Manga Longa", "inverno", 299.9, 0, 77, 1, 1, S, "vestido-cetim-manga-longa.jpg", "Vestido midi de cetim com mangas longas", "Cetim brilhante com mangas longas e decote marcante."],
  ["Vestido Longo Drapeado Vinho", "inverno", 389.9, 0, 68, 0, 1, S, "vestido-drapeado-vinho.jpg", "Vestido longo drapeado em tom vinho", "Drapeados na cintura e comprimento longo para eventos."],
  ["Vestido Lurex Brilho Suave", "inverno", 329.9, 399.9, 58, 0, 1, S, "vestido-lurex.jpg", "Vestido curto de lurex com brilho suave", "Fio metalizado discreto que brilha sob a luz."],
  ["Vestido Midi Assimétrico", "inverno", 259.9, 0, 52, 0, 0, S, "vestido-midi-assimetrico.jpg", "Vestido midi com barra assimétrica", "Barra em diagonal que cria movimento a cada passo."]
];
const PRODUCTS = ROWS.map((r, i) => ({
  id: i + 1, name: r[0], cat: r[1], price: r[2], old: r[3], pop: r[4], isNew: !!r[5], stock: !!r[6],
  sizes: r[7], img: "img/produtos/" + r[8], alt: r[9], pos: "center", desc: r[10]
}));
// Informações demonstrativas exibidas em todas as páginas de produto (edite à vontade)
const DETAILS = {
  "Composição": "Informação de exemplo: edite em js/products.js.",
  "Medidas": "P: busto 88 cm · M: busto 94 cm · G: busto 100 cm (exemplo).",
  "Cuidados": "Lavar à mão em água fria; não usar alvejante; passar em temperatura baixa (exemplo)."
};
