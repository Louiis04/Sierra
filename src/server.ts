import express from 'express';
import cors from 'cors';
import path from 'path';
import { UserProfileTree } from './trees/UserProfileTree';
import { ProductCatalogTree } from './trees/ProductCatalogTree';
import { processUserAction, generateRecommendations } from './logic/RecommendationEngine';
import { Product } from './interfaces/Product.interface';

const userProfile = new UserProfileTree();
const catalog = new ProductCatalogTree();
const DECAY_FACTOR = 0.9;

const products: Product[] = [
    // --- Eletrônicos (1-15) ---
    { id: 'p001', name: 'Notebook Gamer G15', brand: 'Dell', categoryPath: ['Eletrônicos', 'Computadores', 'Notebooks'], description: 'Notebook de alta performance para jogos e trabalho pesado.', keywords: ['notebook', 'gamer', 'dell', 'g15', 'performance', 'jogos', 'computador'] },
    { id: 'p002', name: 'Inspiron 15', brand: 'Dell', categoryPath: ['Eletrônicos', 'Computadores', 'Notebooks'], description: 'Notebook versátil para trabalho e estudo diário.', keywords: ['notebook', 'dell', 'inspiron', 'trabalho', 'estudo', 'computador'] },
    { id: 'p003', name: 'MacBook Air M3', brand: 'Apple', categoryPath: ['Eletrônicos', 'Computadores', 'Notebooks'], description: 'Ultrafino, potente e com bateria para o dia todo. Ideal para profissionais criativos.', keywords: ['notebook', 'apple', 'macbook', 'm3', 'edição', 'design', 'profissional'] },
    { id: 'p004', name: 'Galaxy Watch 6', brand: 'Samsung', categoryPath: ['Eletrônicos', 'Vestíveis', 'Smartwatches'], description: 'Relógio inteligente com monitoramento completo de saúde e esportes.', keywords: ['smartwatch', 'samsung', 'galaxy', 'watch', 'saúde', 'corrida', 'fitness'] },
    { id: 'p005', name: 'Apple Watch Series 9', brand: 'Apple', categoryPath: ['Eletrônicos', 'Vestíveis', 'Smartwatches'], description: 'O parceiro ideal para uma vida saudável, agora mais inteligente e brilhante.', keywords: ['smartwatch', 'apple', 'watch', 'fitness', 'saúde', 'ios'] },
    { id: 'p006', name: 'Mouse Gamer Cobra', brand: 'Redragon', categoryPath: ['Eletrônicos', 'Periféricos', 'Mouses'], description: 'Mouse com RGB e alta precisão para gamers.', keywords: ['mouse', 'gamer', 'redragon', 'rgb', 'promoção', 'jogos', 'periférico'] },
    { id: 'p007', name: 'Mouse MX Master 3S', brand: 'Logitech', categoryPath: ['Eletrônicos', 'Periféricos', 'Mouses'], description: 'Mouse ergonômico de alta precisão para produtividade e trabalho intenso.', keywords: ['mouse', 'logitech', 'mx master', 'trabalho', 'produtividade', 'sem fio'] },
    { id: 'p008', name: 'Fone de Ouvido SportFit Pro', brand: 'SoundCore', categoryPath: ['Eletrônicos', 'Áudio', 'Fones'], description: 'Fone de ouvido sem fio, ideal para corrida e esportes.', keywords: ['fone', 'ouvido', 'sem fio', 'corrida', 'esportes', 'soundcore', 'bluetooth'] },
    { id: 'p009', name: 'Headphone WH-1000XM5', brand: 'Sony', categoryPath: ['Eletrônicos', 'Áudio', 'Headphones'], description: 'Cancelamento de ruído líder de mercado para uma imersão sonora incomparável.', keywords: ['headphone', 'fone', 'sony', 'cancelamento de ruído', 'bluetooth', 'viagem'] },
    { id: 'p010', name: 'Smartphone Galaxy S24', brand: 'Samsung', categoryPath: ['Eletrônicos', 'Celulares', 'Smartphones'], description: 'Smartphone com câmera de alta resolução e inteligência artificial.', keywords: ['celular', 'smartphone', 'samsung', 'galaxy', 's24', 'câmera', 'android'] },
    { id: 'p011', name: 'iPhone 15 Pro', brand: 'Apple', categoryPath: ['Eletrônicos', 'Celulares', 'Smartphones'], description: 'Design em titânio, chip A17 Pro e o melhor sistema de câmeras já visto em um iPhone.', keywords: ['celular', 'smartphone', 'apple', 'iphone', '15 pro', 'câmera', 'ios'] },
    { id: 'p012', name: 'Smart TV Crystal 4K 55"', brand: 'LG', categoryPath: ['Eletrônicos', 'TV e Vídeo', 'Smart TVs'], description: 'TV com resolução 4K, HDR e acesso a todos os seus apps de streaming.', keywords: ['tv', 'smart tv', 'lg', '4k', 'uhd', 'streaming', 'sala'] },
    { id: 'p013', name: 'Console Playstation 5', brand: 'Sony', categoryPath: ['Eletrônicos', 'Games', 'Consoles'], description: 'A nova geração de jogos com carregamento ultra-rápido e gráficos incríveis.', keywords: ['console', 'playstation', 'ps5', 'sony', 'jogos', 'gamer', '4k'] },
    { id: 'p014', name: 'Console Xbox Series X', brand: 'Microsoft', categoryPath: ['Eletrônicos', 'Games', 'Consoles'], description: 'O Xbox mais rápido e poderoso de todos os tempos. Jogue milhares de títulos.', keywords: ['console', 'xbox', 'series x', 'microsoft', 'jogos', 'gamer', 'game pass'] },
    { id: 'p015', name: 'Câmera Mirrorless Alpha a6400', brand: 'Sony', categoryPath: ['Eletrônicos', 'Câmeras e Filmadoras'], description: 'Câmera compacta com foco automático rápido, ideal para vlogs e fotografia.', keywords: ['câmera', 'sony', 'alpha', 'mirrorless', 'fotografia', 'vlog', '4k'] },

    // --- Livros (16-25) ---
    { id: 'p016', name: 'Livro: Duna', brand: 'Aleph', categoryPath: ['Livros', 'Ficção Científica'], description: 'Um clássico da ficção científica sobre política e poder em um futuro distante.', keywords: ['livro', 'duna', 'ficção', 'científica', 'frank herbert', 'leitura'] },
    { id: 'p017', name: 'Livro: Fundação', brand: 'Aleph', categoryPath: ['Livros', 'Ficção Científica'], description: 'A obra-prima de Isaac Asimov sobre o futuro da humanidade e a psico-história.', keywords: ['livro', 'fundação', 'asimov', 'ficção', 'científica', 'leitura'] },
    { id: 'p018', name: 'Livro: O Senhor dos Anéis', brand: 'HarperCollins', categoryPath: ['Livros', 'Fantasia'], description: 'A saga épica de Frodo para destruir o Um Anel e salvar a Terra-média.', keywords: ['livro', 'senhor dos anéis', 'tolkien', 'fantasia', 'épico', 'leitura'] },
    { id: 'p019', name: 'Livro: O Nome do Vento', brand: 'Arqueiro', categoryPath: ['Livros', 'Fantasia'], description: 'A história de Kvothe, um herói e vilão de sua própria lenda.', keywords: ['livro', 'o nome do vento', 'fantasia', 'patrick rothfuss', 'leitura'] },
    { id: 'p020', name: 'Livro: Hábitos Atômicos', brand: 'Sextante', categoryPath: ['Livros', 'Não-Ficção', 'Autoajuda'], description: 'Um método comprovado para criar bons hábitos e quebrar os maus.', keywords: ['livro', 'hábitos', 'produtividade', 'desenvolvimento pessoal', 'james clear'] },
    { id: 'p021', name: 'Livro: Sapiens - Uma Breve História da Humanidade', brand: 'L&PM', categoryPath: ['Livros', 'Não-Ficção', 'História'], description: 'Uma análise de como o Homo sapiens evoluiu de caçador-coletor a governante do planeta.', keywords: ['livro', 'sapiens', 'história', 'humanidade', 'yuval noah harari'] },
    { id: 'p022', name: 'Livro: É Assim que Acaba', brand: 'Galera Record', categoryPath: ['Livros', 'Romance'], description: 'Um romance arrebatador sobre amor, escolhas e resiliência.', keywords: ['livro', 'romance', 'colleen hoover', 'drama', 'leitura'] },
    { id: 'p023', name: 'Livro: O Homem de Giz', brand: 'Intrínseca', categoryPath: ['Livros', 'Suspense e Mistério'], description: 'Um segredo de infância volta para assombrar um grupo de amigos.', keywords: ['livro', 'suspense', 'mistério', 'thriller', 'c.j. tudor'] },
    { id: 'p024', name: 'Mangá: Berserk Vol. 1', brand: 'Panini', categoryPath: ['Livros', 'Quadrinhos e Mangás'], description: 'O início da jornada sombria de Guts, o Espadachim Negro.', keywords: ['mangá', 'quadrinhos', 'berserk', 'panini', 'fantasia', 'dark'] },
    { id: 'p025', name: 'Box Sherlock Holmes', brand: 'Zahar', categoryPath: ['Livros', 'Clássicos'], description: 'A obra completa de Arthur Conan Doyle sobre o detetive mais famoso do mundo.', keywords: ['livro', 'sherlock holmes', 'clássico', 'mistério', 'detetive', 'box'] },
    
    // --- Casa e Cozinha (26-40) ---
    { id: 'p026', name: 'Air Fryer 5L', brand: 'Mondial', categoryPath: ['Casa e Cozinha', 'Eletroportáteis'], description: 'Fritadeira sem óleo com capacidade para toda a família. Comida saudável e crocante.', keywords: ['air fryer', 'fritadeira', 'mondial', 'cozinha', 'saudável', 'casa'] },
    { id: 'p027', name: 'Cafeteira Espresso PrimaLatte II', brand: 'Oster', categoryPath: ['Casa e Cozinha', 'Eletroportáteis', 'Cafeteiras'], description: 'Prepare seu café espresso, latte ou cappuccino com o toque de um botão.', keywords: ['cafeteira', 'espresso', 'oster', 'café', 'cappuccino', 'cozinha'] },
    { id: 'p028', name: 'Robô Aspirador de Pó', brand: 'iRobot', categoryPath: ['Casa e Cozinha', 'Eletroportáteis'], description: 'Limpa sua casa de forma autônoma, ideal para quem tem pets.', keywords: ['robô', 'aspirador', 'limpeza', 'casa', 'irobot', 'roomba', 'pet'] },
    { id: 'p029', name: 'Liquidificador Power Black', brand: 'Arno', categoryPath: ['Casa e Cozinha', 'Eletroportáteis'], description: 'Alta potência para triturar gelo, frutas congeladas e preparar vitaminas.', keywords: ['liquidificador', 'arno', 'cozinha', 'vitamina', 'suco', 'casa'] },
    { id: 'p030', name: 'Forno de Micro-ondas 20L', brand: 'Electrolux', categoryPath: ['Casa e Cozinha', 'Eletrodomésticos'], description: 'Prático e eficiente para aquecer e descongelar alimentos rapidamente.', keywords: ['micro-ondas', 'forno', 'electrolux', 'cozinha', 'casa'] },
    { id: 'p031', name: 'Geladeira Frost Free Duplex', brand: 'Brastemp', categoryPath: ['Casa e Cozinha', 'Eletrodomésticos'], description: 'Amplo espaço interno e tecnologia Frost Free que dispensa o descongelamento.', keywords: ['geladeira', 'refrigerador', 'brastemp', 'frost free', 'duplex', 'cozinha'] },
    { id: 'p032', name: 'Jogo de Panelas Antiaderente', brand: 'Tramontina', categoryPath: ['Casa e Cozinha', 'Utensílios'], description: 'Conjunto com 5 panelas com revestimento Starflon. Não gruda e fácil de limpar.', keywords: ['panelas', 'jogo', 'tramontina', 'cozinha', 'antiaderente', 'utensílio'] },
    { id: 'p033', name: 'Faqueiro Inox 24 Peças', brand: 'Tramontina', categoryPath: ['Casa e Cozinha', 'Utensílios'], description: 'Conjunto de talheres em aço inox, ideal para o uso diário e para receber visitas.', keywords: ['faqueiro', 'talheres', 'tramontina', 'inox', 'garfo', 'faca'] },
    { id: 'p034', name: 'Purificador de Água', brand: 'Consul', categoryPath: ['Casa e Cozinha', 'Eletrodomésticos'], description: 'Água pura e gelada a qualquer hora, com filtragem de alta eficiência.', keywords: ['purificador', 'água', 'filtro', 'consul', 'saúde', 'cozinha'] },
    { id: 'p035', name: 'Chaleira Elétrica', brand: 'Black+Decker', categoryPath: ['Casa e Cozinha', 'Eletroportáteis'], description: 'Ferve a água em minutos, perfeita para chás, cafés e preparo de alimentos.', keywords: ['chaleira', 'elétrica', 'chá', 'cozinha', 'água quente'] },
    { id: 'p036', name: 'Cadeira de Escritório Gamer', brand: 'DT3sports', categoryPath: ['Móveis', 'Escritório'], description: 'Cadeira ergonômica e reclinável para longas sessões de jogos ou trabalho.', keywords: ['cadeira', 'gamer', 'escritório', 'ergonômica', 'dt3', 'conforto'] },
    { id: 'p037', name: 'Mesa de Jantar 4 Lugares', brand: 'Madesa', categoryPath: ['Móveis', 'Sala de Jantar'], description: 'Mesa com tampo de vidro e design moderno para sua sala de jantar.', keywords: ['mesa', 'jantar', 'madesa', 'móveis', 'sala', '4 lugares'] },
    { id: 'p038', name: 'Sofá Retrátil 3 Lugares', brand: 'Linoforte', categoryPath: ['Móveis', 'Sala de Estar'], description: 'Sofá confortável com assentos retráteis e encostos reclináveis.', keywords: ['sofá', 'retrátil', 'reclinável', 'sala', 'móveis', 'conforto'] },
    { id: 'p039', name: 'Lâmpada Inteligente Wi-Fi', brand: 'Philips Hue', categoryPath: ['Casa e Cozinha', 'Iluminação'], description: 'Controle a cor e a intensidade da luz pelo seu celular ou por voz.', keywords: ['lâmpada', 'inteligente', 'wi-fi', 'rgb', 'automação', 'alexa'] },
    { id: 'p040', name: 'Jogo de Cama Queen Size', brand: 'Artex', categoryPath: ['Cama, Mesa e Banho'], description: 'Jogo de cama 4 peças em algodão 200 fios, macio e confortável.', keywords: ['cama', 'lençol', 'queen', 'artex', 'quarto', 'algodão'] },
    
    // --- Moda (41-50) ---
    { id: 'p041', name: 'Tênis de Corrida Ultraboost', brand: 'Adidas', categoryPath: ['Moda', 'Calçados', 'Tênis'], description: 'Tênis com amortecimento responsivo para corridas de longa distância.', keywords: ['tênis', 'corrida', 'adidas', 'ultraboost', 'esportes', 'performance', 'masculino'] },
    { id: 'p042', name: 'Tênis Casual Court Vision', brand: 'Nike', categoryPath: ['Moda', 'Calçados', 'Tênis'], description: 'Tênis de estilo retrô inspirado no basquete dos anos 80.', keywords: ['tênis', 'casual', 'nike', 'court vision', 'moda', 'sneaker'] },
    { id: 'p043', name: 'Camisa Polo Básica', brand: 'Hering', categoryPath: ['Moda', 'Roupas', 'Camisetas'], description: 'Camisa polo de algodão, versátil para o dia a dia e trabalho casual.', keywords: ['camisa', 'polo', 'hering', 'roupa', 'masculino', 'básico'] },
    { id: 'p044', name: 'Jaqueta Corta-Vento', brand: 'The North Face', categoryPath: ['Moda', 'Roupas', 'Casacos'], description: 'Jaqueta leve e resistente ao vento, ideal para atividades ao ar livre.', keywords: ['jaqueta', 'corta-vento', 'the north face', 'trilha', 'esportes'] },
    { id: 'p045', name: 'Calça Jeans Skinny', brand: 'Levi\'s', categoryPath: ['Moda', 'Roupas', 'Calças'], description: 'Calça jeans com modelagem skinny e tecido com elastano para maior conforto.', keywords: ['calça', 'jeans', 'levis', 'skinny', 'moda', 'feminino'] },
    { id: 'p046', name: 'Vestido Midi Floral', brand: 'Farm', categoryPath: ['Moda', 'Roupas', 'Vestidos'], description: 'Vestido com estampa vibrante e caimento fluido, a cara do verão.', keywords: ['vestido', 'farm', 'estampado', 'floral', 'moda', 'feminino'] },
    { id: 'p047', name: 'Relógio Analógico de Couro', brand: 'Fossil', categoryPath: ['Moda', 'Acessórios', 'Relógios'], description: 'Relógio clássico com pulseira de couro, elegante e atemporal.', keywords: ['relógio', 'fossil', 'couro', 'analógico', 'acessório', 'masculino'] },
    { id: 'p048', 'name': 'Óculos de Sol Aviador', brand: 'Ray-Ban', categoryPath: ['Moda', 'Acessórios', 'Óculos de Sol'], description: 'O icônico modelo aviador, sinônimo de estilo e proteção.', keywords: ['óculos', 'sol', 'ray-ban', 'aviador', 'estilo', 'acessório'] },
    { id: 'p049', name: 'Mochila para Notebook', brand: 'Samsonite', categoryPath: ['Moda', 'Acessórios', 'Bolsas e Mochilas'], description: 'Mochila executiva com compartimento acolchoado para notebook de até 15".', keywords: ['mochila', 'notebook', 'samsonite', 'trabalho', 'viagem', 'executiva'] },
    { id: 'p050', name: 'Bolsa de Couro Tote', brand: 'Arezzo', categoryPath: ['Moda', 'Acessórios', 'Bolsas e Mochilas'], description: 'Bolsa feminina espaçosa e elegante para o dia a dia.', keywords: ['bolsa', 'couro', 'arezzo', 'tote', 'feminino', 'acessório'] },

    // --- Esportes e Lazer (51-60) ---
    { id: 'p051', name: 'Bicicleta Aro 29 Mountain Bike', brand: 'Caloi', categoryPath: ['Esportes e Lazer', 'Ciclismo'], description: 'Bicicleta com 21 marchas e freio a disco, ideal para trilhas leves.', keywords: ['bicicleta', 'bike', 'caloi', 'aro 29', 'trilha', 'esportes', 'ciclismo'] },
    { id: 'p052', name: 'Barraca de Camping Iglu 4 Pessoas', brand: 'Mor', categoryPath: ['Esportes e Lazer', 'Camping'], description: 'Barraca resistente à chuva e fácil de montar, para acampamentos em família.', keywords: ['barraca', 'camping', 'acampamento', 'mor', 'trilha', 'lazer'] },
    { id: 'p053', name: 'Bola de Futebol Campo', brand: 'Nike', categoryPath: ['Esportes e Lazer', 'Futebol'], description: 'Bola oficial de futebol de campo, com alta durabilidade e precisão.', keywords: ['bola', 'futebol', 'nike', 'campo', 'esportes'] },
    { id: 'p054', name: 'Kit Halteres 5kg', brand: 'Ahead Sports', categoryPath: ['Esportes e Lazer', 'Fitness e Musculação'], description: 'Par de halteres emborrachados para treinos de força em casa.', keywords: ['halteres', 'peso', 'musculação', 'fitness', 'treino', 'casa'] },
    { id: 'p055', name: 'Tapete de Yoga', brand: 'Yogamat', categoryPath: ['Esportes e Lazer', 'Yoga e Pilates'], description: 'Tapete antiderrapante para prática de yoga, pilates e outros exercícios.', keywords: ['tapete', 'yoga', 'pilates', 'exercício', 'fitness', 'yogamat'] },
    { id: 'p056', name: 'Skate Montado Iniciante', brand: 'Element', categoryPath: ['Esportes e Lazer', 'Skate'], description: 'Skate completo, ideal para quem está começando no esporte.', keywords: ['skate', 'element', 'iniciante', 'esportes', 'radical'] },
    { id: 'p057', name: 'Prancha de Surf Funboard', brand: 'Mormaii', categoryPath: ['Esportes e Lazer', 'Surf'], description: 'Prancha com boa flutuação, ideal para ondas pequenas e surfistas iniciantes.', keywords: ['prancha', 'surf', 'mormaii', 'funboard', 'mar', 'praia'] },
    { id: 'p058', name: 'Bola de Basquete', brand: 'Spalding', categoryPath: ['Esportes e Lazer', 'Basquete'], description: 'Bola de basquete de borracha, tamanho oficial, para jogos em quadras externas.', keywords: ['bola', 'basquete', 'spalding', 'nba', 'quadra', 'esportes'] },
    { id: 'p059', name: 'Corda de Pular de Aço', brand: 'Acte Sports', categoryPath: ['Esportes e Lazer', 'Fitness e Musculação'], description: 'Corda de pular com rolamento para treinos de cardio de alta intensidade.', keywords: ['corda', 'pular', 'cardio', 'crossfit', 'fitness', 'treino'] },
    { id: 'p060', name: 'Cadeira de Praia', brand: 'Mor', categoryPath: ['Esportes e Lazer', 'Praia e Piscina'], description: 'Cadeira de alumínio reclinável, leve e prática para levar à praia.', keywords: ['cadeira', 'praia', 'piscina', 'mor', 'lazer', 'verão'] },

    // --- Beleza e Cuidados Pessoais (61-70) ---
    { id: 'p061', name: 'Secador de Cabelo Profissional', brand: 'Taiff', categoryPath: ['Beleza e Cuidados', 'Cabelos'], description: 'Secador com alta potência e íons negativos para menos frizz e mais brilho.', keywords: ['secador', 'cabelo', 'taiff', 'beleza', 'profissional', 'salão'] },
    { id: 'p062', name: 'Protetor Solar Facial FPS 60', brand: 'La Roche-Posay', categoryPath: ['Beleza e Cuidados', 'Pele'], description: 'Protetor solar com toque seco e alta proteção contra raios UVA/UVB.', keywords: ['protetor solar', 'pele', 'rosto', 'la roche-posay', 'cuidado', 'verão'] },
    { id: 'p063', name: 'Perfume One Million Masculino', brand: 'Paco Rabanne', categoryPath: ['Beleza e Cuidados', 'Perfumes'], description: 'Fragrância amadeirada e especiada, um clássico da perfumaria masculina.', keywords: ['perfume', 'masculino', 'paco rabanne', 'one million', 'importado'] },
    { id: 'p064', name: 'Perfume La Vie Est Belle Feminino', brand: 'Lancôme', categoryPath: ['Beleza e Cuidados', 'Perfumes'], description: 'Uma fragrância floral frutada gourmand que celebra a alegria de viver.', keywords: ['perfume', 'feminino', 'lancôme', 'la vie est belle', 'importado'] },
    { id: 'p065', name: 'Base Líquida Fit Me', brand: 'Maybelline', categoryPath: ['Beleza e Cuidados', 'Maquiagem'], description: 'Base com efeito mate e controle de oleosidade para um acabamento natural.', keywords: ['base', 'maquiagem', 'maybelline', 'fit me', 'rosto', 'mate'] },
    { id: 'p066', name: 'Barbeador Elétrico OneBlade', brand: 'Philips', categoryPath: ['Beleza e Cuidados', 'Barba'], description: 'Apara, contorna e raspa qualquer comprimento de pelo, sem irritar a pele.', keywords: ['barbeador', 'elétrico', 'philips', 'oneblade', 'barba', 'aparador'] },
    { id: 'p067', name: 'Shampoo e Condicionador Hidratante', brand: 'Wella', categoryPath: ['Beleza e Cuidados', 'Cabelos'], description: 'Kit profissional para cabelos secos e danificados, promove hidratação intensa.', keywords: ['shampoo', 'condicionador', 'wella', 'cabelo', 'hidratação', 'kit'] },
    { id: 'p068', name: 'Creme Hidratante Corporal', brand: 'Nivea', categoryPath: ['Beleza e Cuidados', 'Pele'], description: 'Hidratação profunda por 48 horas com a fragrância clássica da Nivea.', keywords: ['creme', 'hidratante', 'corpo', 'nivea', 'pele', 'cuidado'] },
    { id: 'p069', name: 'Escova de Dente Elétrica', brand: 'Oral-B', categoryPath: ['Beleza e Cuidados', 'Higiene Bucal'], description: 'Remove até 100% mais placa do que uma escova manual.', keywords: ['escova de dente', 'elétrica', 'oral-b', 'higiene', 'saúde bucal'] },
    { id: 'p070', name: 'Batom Líquido Matte', brand: 'MAC', categoryPath: ['Beleza e Cuidados', 'Maquiagem'], description: 'Batom líquido de longa duração com acabamento ultra fosco.', keywords: ['batom', 'mac', 'matte', 'maquiagem', 'boca', 'líquido'] },

    // --- Ferramentas (71-75) ---
    { id: 'p071', name: 'Furadeira de Impacto 500W', brand: 'Bosch', categoryPath: ['Ferramentas', 'Ferramentas Elétricas'], description: 'Furadeira potente para perfurar madeira, metal e concreto. Essencial para reformas.', keywords: ['furadeira', 'bosch', 'ferramenta', 'elétrica', 'reforma', 'casa'] },
    { id: 'p072', name: 'Kit de Ferramentas com 110 Peças', brand: 'Tramontina', categoryPath: ['Ferramentas', 'Ferramentas Manuais'], description: 'Maleta completa com alicates, chaves de fenda, martelo e muito mais.', keywords: ['kit', 'ferramentas', 'tramontina', 'maleta', 'reparo', 'manutenção'] },
    { id: 'p073', name: 'Parafusadeira a Bateria 12V', brand: 'Makita', categoryPath: ['Ferramentas', 'Ferramentas Elétricas'], description: 'Leve e compacta, ideal para montagem de móveis e pequenos reparos.', keywords: ['parafusadeira', 'makita', 'bateria', 'sem fio', 'ferramenta', 'móveis'] },
    { id: 'p074', name: 'Serra Tico-Tico', brand: 'Black+Decker', categoryPath: ['Ferramentas', 'Ferramentas Elétricas'], description: 'Para cortes retos e curvos em madeira, metal e plástico.', keywords: ['serra', 'tico-tico', 'ferramenta', 'marcenaria', 'madeira'] },
    { id: 'p075', name: 'Trena a Laser 40m', brand: 'Bosch', categoryPath: ['Ferramentas', 'Medição'], description: 'Medição de distâncias, áreas e volumes com precisão e rapidez.', keywords: ['trena', 'laser', 'bosch', 'medição', 'distância', 'reforma'] },
    
    // --- Brinquedos e Jogos (76-80) ---
    { id: 'p076', name: 'LEGO Classic Caixa Grande', brand: 'LEGO', categoryPath: ['Brinquedos e Jogos', 'Blocos de Montar'], description: 'Centenas de peças para dar asas à imaginação e criar o que quiser.', keywords: ['lego', 'blocos', 'brinquedo', 'criança', 'montar', 'criatividade'] },
    { id: 'p077', name: 'Jogo de Tabuleiro Catan', brand: 'Devir', categoryPath: ['Brinquedos e Jogos', 'Jogos de Tabuleiro'], description: 'Colonize uma ilha, negocie recursos e dispute o domínio de Catan.', keywords: ['jogo', 'tabuleiro', 'catan', 'estratégia', 'família', 'amigos'] },
    { id: 'p078', name: 'Quebra-Cabeça 1000 Peças', brand: 'Grow', categoryPath: ['Brinquedos e Jogos', 'Quebra-Cabeças'], description: 'Desafie sua mente e relaxe montando uma bela imagem.', keywords: ['quebra-cabeça', 'puzzle', 'grow', '1000 peças', 'lazer', 'hobby'] },
    { id: 'p079', name: 'Boneca Baby Alive', brand: 'Hasbro', categoryPath: ['Brinquedos e Jogos', 'Bonecos e Bonecas'], description: 'A boneca que come, bebe e faz xixi, para uma brincadeira de cuidar.', keywords: ['boneca', 'baby alive', 'hasbro', 'brinquedo', 'criança', 'menina'] },
    { id: 'p080', name: 'Carrinho de Controle Remoto', brand: 'Candide', categoryPath: ['Brinquedos e Jogos', 'Veículos de Brinquedo'], description: 'Carrinho de alta velocidade com controle remoto para manobras radicais.', keywords: ['carrinho', 'controle remoto', 'brinquedo', 'menino', 'velocidade'] },
    
    // --- Instrumentos Musicais (81-85) ---
    { id: 'p081', name: 'Violão Acústico de Nylon', brand: 'Tagima', categoryPath: ['Instrumentos Musicais', 'Instrumentos de Corda'], description: 'Violão clássico para iniciantes, com cordas de nylon macias.', keywords: ['violão', 'tagima', 'nylon', 'acústico', 'iniciante', 'música'] },
    { id: 'p082', name: 'Teclado Musical 61 Teclas', brand: 'Casio', categoryPath: ['Instrumentos Musicais', 'Teclados e Pianos'], description: 'Teclado com centenas de timbres e ritmos, ideal para estudo e aprendizado.', keywords: ['teclado', 'casio', 'piano', 'musical', 'iniciante', 'música'] },
    { id: 'p083', name: 'Ukulele Soprano', brand: 'Akahai', categoryPath: ['Instrumentos Musicais', 'Instrumentos de Corda'], description: 'Pequeno, divertido e fácil de tocar, perfeito para começar na música.', keywords: ['ukulele', 'akahai', 'soprano', 'música', 'hobby'] },
    { id: 'p084', name: 'Microfone Condensador USB', brand: 'Audio-Technica', categoryPath: ['Instrumentos Musicais', 'Microfones'], description: 'Microfone de alta qualidade para gravação de voz, podcasts e streaming.', keywords: ['microfone', 'usb', 'condensador', 'gravação', 'podcast', 'streaming'] },
    { id: 'p085', name: 'Guitarra Elétrica Stratocaster', brand: 'Fender', categoryPath: ['Instrumentos Musicais', 'Instrumentos de Corda'], description: 'O som icônico de uma das guitarras mais famosas do mundo.', keywords: ['guitarra', 'fender', 'stratocaster', 'elétrica', 'rock', 'música'] },
    
    // --- Pet Shop (86-90) ---
    { id: 'p086', name: 'Ração para Cães Adultos 15kg', brand: 'Royal Canin', categoryPath: ['Pet Shop', 'Cachorros', 'Alimentação'], description: 'Alimento completo e balanceado para cães adultos de porte médio.', keywords: ['ração', 'cachorro', 'cão', 'royal canin', 'pet', 'alimento'] },
    { id: 'p087', name: 'Ração para Gatos Castrados 10kg', brand: 'Premier', categoryPath: ['Pet Shop', 'Gatos', 'Alimentação'], description: 'Ração formulada para manter o peso e a saúde de gatos castrados.', keywords: ['ração', 'gato', 'premier', 'pet', 'alimento', 'castrado'] },
    { id: 'p088', name: 'Arranhador para Gatos Torre', brand: 'São Pet', categoryPath: ['Pet Shop', 'Gatos', 'Brinquedos e Acessórios'], description: 'Arranhador com múltiplos andares para seu gato se divertir e afiar as unhas.', keywords: ['arranhador', 'gato', 'torre', 'pet', 'brinquedo', 'acessório'] },
    { id: 'p089', name: 'Cama para Cachorro', brand: 'Futton Dog', categoryPath: ['Pet Shop', 'Cachorros', 'Caminhas e Casinhas'], description: 'Cama macia e confortável para o descanso do seu melhor amigo.', keywords: ['cama', 'cachorro', 'caminha', 'pet', 'conforto', 'descanso'] },
    { id: 'p090', name: 'Coleira com Guia', brand: 'Zee.Dog', categoryPath: ['Pet Shop', 'Cachorros', 'Passeio'], description: 'Conjunto de coleira e guia com estampas exclusivas e super resistentes.', keywords: ['coleira', 'guia', 'cachorro', 'zeedog', 'passeio', 'pet'] },

    // --- Automotivo (91-95) ---
    { id: 'p091', name: 'Pneu Aro 15 185/60R15', brand: 'Pirelli', categoryPath: ['Automotivo', 'Pneus e Rodas'], description: 'Pneu de alta performance para carros de passeio, com boa aderência em pista molhada.', keywords: ['pneu', 'pirelli', 'carro', 'automotivo', 'aro 15', 'segurança'] },
    { id: 'p092', name: 'Central Multimídia com CarPlay', brand: 'Pioneer', categoryPath: ['Automotivo', 'Som e Vídeo'], description: 'Tela de 7 polegadas com espelhamento para Apple CarPlay e Android Auto.', keywords: ['multimídia', 'som', 'pioneer', 'carro', 'carplay', 'android auto'] },
    { id: 'p093', name: 'Cera Automotiva Carnaúba', brand: 'Meguiar\'s', categoryPath: ['Automotivo', 'Limpeza e Cuidado'], description: 'Cera de carnaúba para um brilho intenso e proteção duradoura da pintura.', keywords: ['cera', 'carro', 'meguiars', 'limpeza', 'cuidado', 'estética'] },
    { id: 'p094', name: 'Aspirador de Pó Portátil 12V', brand: 'Tramontina', categoryPath: ['Automotivo', 'Acessórios Internos'], description: 'Aspirador compacto para ligar no acendedor do carro e manter o interior limpo.', keywords: ['aspirador', 'carro', 'portátil', 'limpeza', 'automotivo'] },
    { id: 'p095', name: 'Capa para Carro Impermeável', brand: 'Carrhel', categoryPath: ['Automotivo', 'Acessórios Externos'], description: 'Protege seu veículo do sol, chuva e poeira.', keywords: ['capa', 'carro', 'proteção', 'impermeável', 'garagem'] },

    // --- Alimentos e Bebidas (96-100) ---
    { id: 'p096', name: 'Café em Grãos Gourmet 1kg', brand: 'Orfeu', categoryPath: ['Alimentos e Bebidas', 'Cafés, Chás e Achocolatados'], description: 'Café especial 100% arábica, com notas de chocolate e caramelo.', keywords: ['café', 'gourmet', 'grãos', 'orfeu', 'especial', 'bebida'] },
    { id: 'p097', name: 'Vinho Tinto Chileno Cabernet Sauvignon', brand: 'Casillero del Diablo', categoryPath: ['Alimentos e Bebidas', 'Vinhos e Espumantes'], description: 'Vinho tinto encorpado e frutado, perfeito para acompanhar massas e carnes.', keywords: ['vinho', 'tinto', 'chileno', 'cabernet', 'bebida', 'adega'] },
    { id: 'p098', name: 'Azeite de Oliva Extra Virgem 500ml', brand: 'Gallo', categoryPath: ['Alimentos e Bebidas', 'Azeites, Óleos e Vinagres'], description: 'Azeite português com baixa acidez, ideal para saladas e finalização de pratos.', keywords: ['azeite', 'extra virgem', 'gallo', 'oliva', 'gourmet', 'alimento'] },
    { id: 'p099', name: 'Chocolate Amargo 70% Cacau', brand: 'Lindt', categoryPath: ['Alimentos e Bebidas', 'Doces e Sobremesas'], description: 'Chocolate suíço com sabor intenso de cacau, para os verdadeiros apreciadores.', keywords: ['chocolate', 'amargo', 'cacau', 'lindt', 'doce', 'gourmet'] },
    { id: 'p100', name: 'Whisky Escocês 12 Anos', brand: 'Johnnie Walker', categoryPath: ['Alimentos e Bebidas', 'Bebidas Alcoólicas'], description: 'Blended scotch whisky suave e complexo, ideal para ser apreciado puro ou com gelo.', keywords: ['whisky', 'escocês', '12 anos', 'johnnie walker', 'bebida', 'destilado'] }
];
products.forEach(p => catalog.addProduct(p));

const app = express();
app.use(cors()); 
app.use(express.json()); 

app.use(express.static(path.join(__dirname, '..', 'public')));



app.post('/api/user/action', (req, res) => {
    const { action_text } = req.body;
    if (!action_text) {
        return res.status(400).json({ error: 'action_text is required' });
    }

    userProfile.applyDecay(DECAY_FACTOR);
    const tokens = processUserAction(action_text);
    tokens.forEach(token => userProfile.insert(token, 5.0)); 

    res.json({ status: 'success', tokens_added: tokens });
});

app.get('/api/user/profile', (req, res) => {
    const profileTokens = userProfile.getTopTokens(10).map(t => ({
        token: t.token,
        relevance: parseFloat(t.weight.toFixed(2))
    }));
    res.json({ profile: profileTokens });
});

app.get('/api/recommendations', (req, res) => {
    const recommendations = generateRecommendations(userProfile, catalog, 10);
    
    const response = recommendations.map(rec => ({
        product: {
            name: rec.product.name,
            brand: rec.product.brand,
            category: rec.product.categoryPath.join(' > '),
            description: rec.product.description
        },
        affinity_score: parseFloat(rec.score.toFixed(2)),
        matching_tokens: rec.matchingTokens
    }));
    
    res.json({ recommendations: response });
});

app.get('/api/user/profile/tree', (req, res) => {
    const treeStructure = userProfile.getTreeStructure();
    res.json(treeStructure);
});

app.get('/api/categories', (req, res) => {
    const categoryTree = catalog.getCategoryTreeStructure();
    res.json(categoryTree);
});

app.get('/api/products/by-category', (req, res) => {
    const categoryPathQuery = req.query.path;
    if (typeof categoryPathQuery !== 'string') {
        return res.status(400).json({ error: 'Query param "path" must be a string' });
    }
    
    const categoryPath = categoryPathQuery.split(',');
    
    const products = catalog.findProductsByCategory(categoryPath);
    
    const response = products.map(p => ({
        product: {
            name: p.name,
            brand: p.brand,
            category: p.categoryPath.join(' > '),
            description: p.description
        }
    }));
    
    res.json({ products: response });
});

app.post('/api/user/profile/update-token', (req, res) => {
    const { token, newWeight } = req.body;
    if (typeof token !== 'string' || typeof newWeight !== 'number') {
        return res.status(400).json({ error: 'token (string) and newWeight (number) are required' });
    }
    
    userProfile.update(token, newWeight);
    
    res.json({ status: 'success', message: `Token '${token}' updated to weight ${newWeight}`});
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de recomendação rodando em http://localhost:${PORT}`);
    console.log('📚 Catálogo inicializado com', catalog.getAllProducts().length, 'produtos.');
});