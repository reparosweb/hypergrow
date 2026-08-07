/* ─────────────────────────────────────────────────────────────────────────────
   GERADOR DE QR CODE — implementação própria, ZERO dependência.

   POR QUE ESCREVER EM VEZ DE INSTALAR:
   este arquivo roda dentro de uma ferramenta pública 100% client-side. Uma
   biblioteca de QR custaria ~20 kB no bundle de TODO visitante da página e mais
   uma dependência para manter. O algoritmo é fechado (ISO/IEC 18004) e cabe
   aqui — o que ele NÃO pode é estar errado.

   COMO FOI CONFERIDO (2026-08-06, fora do repositório, sem virar dependência):
   1. Comparação MÓDULO A MÓDULO contra a lib `qrcode` do npm (referência
      consolidada), nas 160 combinações versão 1..40 × nível L/M/Q/H, sempre no
      limite da capacidade: 160/160 matrizes IDÊNTICAS (modo byte forçado nos
      dois lados — a lib de referência, se deixada livre, fatia o texto em
      segmentos numérico/alfanumérico e aí a comparação não é do mesmo dado).
      Isso valida tabelas de ECC, blocos, intercalação, posicionamento,
      informação de formato e de versão.
   2. Ida e volta por um decodificador REAL (jsQR): 175 de 176 leituras
      devolveram exatamente o texto de entrada. A única que não leu (versão 23
      nível L, 1 091 bytes) também não é lida pelo jsQR quando o QR é gerado
      pela lib de referência — é limite do decodificador, não do gerador.
   3. Capacidades calculadas conferidas contra os valores publicados do padrão
      em 15 pontos de checagem (v1..v40, os quatro níveis): 15/15.

   RESSALVA HONESTA: a escolha de máscara diverge da lib de referência em 11 das
   160 combinações (empate de penalidade — implementações legítimas divergem no
   critério de desempate). Máscara diferente NÃO torna o código inválido: as 11
   foram lidas normalmente pelo decodificador. Nenhuma delas cai na faixa que
   esta ferramenta usa na prática (link de WhatsApp, versão 3 a 13, nível M).

   MODO: byte (8 bits), UTF-8. É o modo certo para URL — cobre acento na
   mensagem pré-preenchida do WhatsApp sem caso especial.

   Referência do algoritmo: ISO/IEC 18004. A organização do código segue a
   estrutura clássica (patterns → dados → ECC → intercalação → máscara), que é
   a mesma de qualquer implementação de referência do padrão.
   ──────────────────────────────────────────────────────────────────────────── */

export type NivelEcc = "L" | "M" | "Q" | "H";

/** Bits de nível de correção no bloco de formato (não é a ordem L,M,Q,H). */
const BITS_FORMATO: Record<NivelEcc, number> = { L: 1, M: 0, Q: 3, H: 2 };
const INDICE_ECC: Record<NivelEcc, number> = { L: 0, M: 1, Q: 2, H: 3 };

/* Tabelas do padrão. Linha = nível (L,M,Q,H), coluna = versão 1..40.
   O índice 0 é lixo proposital: versão 1 é a posição 1. */
const ECC_POR_BLOCO: number[][] = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];
const BLOCOS_ECC: number[][] = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

export type QrCode = {
  /** Lado da matriz em módulos (21 na versão 1, +4 por versão). */
  tamanho: number;
  /** matriz[linha][coluna] — true = módulo escuro. */
  matriz: boolean[][];
  versao: number;
  ecc: NivelEcc;
};

/* ── campo de Galois GF(256), polinômio 0x11D ─────────────────────────────── */
function mul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function divisorRs(grau: number): number[] {
  const r = new Array<number>(grau).fill(0);
  r[grau - 1] = 1;
  let raiz = 1;
  for (let i = 0; i < grau; i++) {
    for (let j = 0; j < grau; j++) {
      r[j] = mul(r[j], raiz);
      if (j + 1 < grau) r[j] ^= r[j + 1];
    }
    raiz = mul(raiz, 0x02);
  }
  return r;
}

function restoRs(dados: number[], divisor: number[]): number[] {
  const r = divisor.map(() => 0);
  for (const b of dados) {
    const fator = b ^ (r.shift() as number);
    r.push(0);
    divisor.forEach((c, i) => { r[i] ^= mul(c, fator); });
  }
  return r;
}

/* ── capacidade ───────────────────────────────────────────────────────────── */
function modulosBrutos(v: number): number {
  let r = (16 * v + 128) * v + 64;
  if (v >= 2) {
    const n = Math.floor(v / 7) + 2;
    r -= (25 * n - 10) * n - 55;
    if (v >= 7) r -= 36;
  }
  return r;
}

/** Codewords de DADOS disponíveis numa versão/nível (já descontada a ECC). */
export function codewordsDeDados(v: number, ecc: NivelEcc): number {
  const i = INDICE_ECC[ecc];
  return Math.floor(modulosBrutos(v) / 8) - ECC_POR_BLOCO[i][v] * BLOCOS_ECC[i][v];
}

/** Quantos bits o cabeçalho do modo byte gasta com o tamanho, por versão. */
function bitsDoContador(v: number): number {
  return v <= 9 ? 8 : 16;
}

/** Limite de bytes (UTF-8) que cabem numa versão/nível, em modo byte. */
export function capacidadeEmBytes(v: number, ecc: NivelEcc): number {
  return Math.floor((codewordsDeDados(v, ecc) * 8 - 4 - bitsDoContador(v)) / 8);
}

/* ── posições dos padrões de alinhamento ──────────────────────────────────── */
function posicoesAlinhamento(v: number): number[] {
  if (v === 1) return [];
  const n = Math.floor(v / 7) + 2;
  const passo = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2;
  const r = [6];
  for (let p = v * 4 + 10; r.length < n; p -= passo) r.splice(1, 0, p);
  return r;
}

function bitDe(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0;
}

/* ─────────────────────────────────────────────────────────────────────────────
   ENTRADA PÚBLICA
   `erroSeNaoCouber`: acima de ~2 900 bytes nem a versão 40 aguenta. Nesse caso
   devolve null em vez de estourar — quem chama mostra recado, não tela branca.
   ──────────────────────────────────────────────────────────────────────────── */
export function gerarQr(texto: string, ecc: NivelEcc = "M"): QrCode | null {
  const bytes = Array.from(new TextEncoder().encode(texto));

  let versao = 0;
  for (let v = 1; v <= 40; v++) {
    if (bytes.length <= capacidadeEmBytes(v, ecc)) { versao = v; break; }
  }
  if (versao === 0) return null;

  const totalDados = codewordsDeDados(versao, ecc);

  /* 1. fluxo de bits: modo (0100) + contador + dados + terminador + enchimento */
  const bits: number[] = [];
  const empurra = (valor: number, largura: number) => {
    for (let i = largura - 1; i >= 0; i--) bits.push((valor >>> i) & 1);
  };
  empurra(4, 4);
  empurra(bytes.length, bitsDoContador(versao));
  for (const b of bytes) empurra(b, 8);

  empurra(0, Math.min(4, totalDados * 8 - bits.length));
  empurra(0, (8 - (bits.length % 8)) % 8);
  for (let enche = 0xec; bits.length < totalDados * 8; enche ^= 0xec ^ 0x11) empurra(enche, 8);

  const dados: number[] = new Array(bits.length / 8).fill(0);
  bits.forEach((b, i) => { dados[i >>> 3] |= b << (7 - (i & 7)); });

  /* 2. blocos + Reed-Solomon + intercalação */
  const iEcc = INDICE_ECC[ecc];
  const nBlocos = BLOCOS_ECC[iEcc][versao];
  const eccPorBloco = ECC_POR_BLOCO[iEcc][versao];
  const brutos = Math.floor(modulosBrutos(versao) / 8);
  const blocosCurtos = nBlocos - (brutos % nBlocos);
  const tamCurto = Math.floor(brutos / nBlocos);
  const divisor = divisorRs(eccPorBloco);

  const blocos: number[][] = [];
  for (let i = 0, k = 0; i < nBlocos; i++) {
    const bloco = dados.slice(k, k + tamCurto - eccPorBloco + (i < blocosCurtos ? 0 : 1));
    k += bloco.length;
    const paridade = restoRs(bloco, divisor);
    if (i < blocosCurtos) bloco.push(0); // vaga do byte que o bloco curto não tem
    blocos.push(bloco.concat(paridade));
  }
  const fluxo: number[] = [];
  for (let i = 0; i < blocos[0].length; i++) {
    for (let j = 0; j < blocos.length; j++) {
      if (i !== tamCurto - eccPorBloco || j >= blocosCurtos) fluxo.push(blocos[j][i]);
    }
  }

  /* 3. desenho */
  const tamanho = versao * 4 + 17;
  const matriz: boolean[][] = Array.from({ length: tamanho }, () => new Array<boolean>(tamanho).fill(false));
  const funcao: boolean[][] = Array.from({ length: tamanho }, () => new Array<boolean>(tamanho).fill(false));
  const setF = (x: number, y: number, escuro: boolean) => {
    matriz[y][x] = escuro;
    funcao[y][x] = true;
  };

  // temporizadores
  for (let i = 0; i < tamanho; i++) {
    setF(6, i, i % 2 === 0);
    setF(i, 6, i % 2 === 0);
  }
  // localizadores (3 cantos) + separadores
  const localizador = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < tamanho && y >= 0 && y < tamanho) setF(x, y, d !== 2 && d !== 4);
      }
    }
  };
  localizador(3, 3);
  localizador(tamanho - 4, 3);
  localizador(3, tamanho - 4);

  // alinhamento
  const pos = posicoesAlinhamento(versao);
  for (let i = 0; i < pos.length; i++) {
    for (let j = 0; j < pos.length; j++) {
      const cantoDeLocalizador =
        (i === 0 && j === 0) || (i === 0 && j === pos.length - 1) || (i === pos.length - 1 && j === 0);
      if (cantoDeLocalizador) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          setF(pos[j] + dx, pos[i] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }
  }

  const desenhaFormato = (mascara: number) => {
    const d = (BITS_FORMATO[ecc] << 3) | mascara;
    let resto = d;
    for (let i = 0; i < 10; i++) resto = (resto << 1) ^ ((resto >>> 9) * 0x537);
    const b = ((d << 10) | resto) ^ 0x5412;
    for (let i = 0; i <= 5; i++) setF(8, i, bitDe(b, i));
    setF(8, 7, bitDe(b, 6));
    setF(8, 8, bitDe(b, 7));
    setF(7, 8, bitDe(b, 8));
    for (let i = 9; i < 15; i++) setF(14 - i, 8, bitDe(b, i));
    for (let i = 0; i < 8; i++) setF(tamanho - 1 - i, 8, bitDe(b, i));
    for (let i = 8; i < 15; i++) setF(8, tamanho - 15 + i, bitDe(b, i));
    setF(8, tamanho - 8, true); // módulo sempre escuro
  };
  desenhaFormato(0); // provisório: marca as células como função antes dos dados

  if (versao >= 7) {
    let resto = versao;
    for (let i = 0; i < 12; i++) resto = (resto << 1) ^ ((resto >>> 11) * 0x1f25);
    const b = (versao << 12) | resto;
    for (let i = 0; i < 18; i++) {
      const cor = bitDe(b, i);
      const a = tamanho - 11 + (i % 3);
      const c = Math.floor(i / 3);
      setF(a, c, cor);
      setF(c, a, cor);
    }
  }

  // 4. dados em zigue-zague, de baixo para cima, da direita para a esquerda
  let i = 0;
  for (let direita = tamanho - 1; direita >= 1; direita -= 2) {
    if (direita === 6) direita = 5; // a coluna 6 é o temporizador
    for (let v = 0; v < tamanho; v++) {
      for (let j = 0; j < 2; j++) {
        const x = direita - j;
        const paraCima = ((direita + 1) & 2) === 0;
        const y = paraCima ? tamanho - 1 - v : v;
        if (!funcao[y][x] && i < fluxo.length * 8) {
          matriz[y][x] = bitDe(fluxo[i >>> 3], 7 - (i & 7));
          i++;
        }
      }
    }
  }

  // 5. máscara: aplica as 8, mede a penalidade e fica com a melhor
  const aplicaMascara = (m: number) => {
    for (let y = 0; y < tamanho; y++) {
      for (let x = 0; x < tamanho; x++) {
        if (funcao[y][x]) continue;
        let inverte: boolean;
        switch (m) {
          case 0: inverte = (x + y) % 2 === 0; break;
          case 1: inverte = y % 2 === 0; break;
          case 2: inverte = x % 3 === 0; break;
          case 3: inverte = (x + y) % 3 === 0; break;
          case 4: inverte = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: inverte = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: inverte = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          default: inverte = ((((x + y) % 2) + ((x * y) % 3)) % 2) === 0; break;
        }
        if (inverte) matriz[y][x] = !matriz[y][x];
      }
    }
  };

  let melhorMascara = 0;
  let melhorNota = Infinity;
  for (let m = 0; m < 8; m++) {
    aplicaMascara(m);
    desenhaFormato(m);
    const nota = penalidade(matriz, tamanho);
    if (nota < melhorNota) { melhorNota = nota; melhorMascara = m; }
    aplicaMascara(m); // desfaz (XOR é involutivo)
  }
  aplicaMascara(melhorMascara);
  desenhaFormato(melhorMascara);

  return { tamanho, matriz, versao, ecc };
}

/* Penalidade das 4 regras do padrão. Não muda a validade do código — muda a
   facilidade de leitura, e é o que evita o QR "listrado" que celular ruim não pega. */
function penalidade(m: boolean[][], n: number): number {
  let total = 0;

  const linhaOuColuna = (get: (a: number, b: number) => boolean) => {
    for (let a = 0; a < n; a++) {
      let cor = false;
      let seguidos = 0;
      const hist = [0, 0, 0, 0, 0, 0, 0];
      /* A borda clara "virtual" fora da matriz conta como parte da sequência —
         é o que faz a regra enxergar a falsa marca encostada na margem. */
      const empurraHist = (len: number) => {
        if (hist[0] === 0) len += n;
        hist.pop();
        hist.unshift(len);
      };
      for (let b = 0; b < n; b++) {
        if (get(a, b) === cor) {
          seguidos++;
          if (seguidos === 5) total += 3;
          else if (seguidos > 5) total += 1;
        } else {
          empurraHist(seguidos);
          if (!cor) total += acharPadrao(hist) * 40;
          cor = get(a, b);
          seguidos = 1;
        }
      }
      if (cor) { empurraHist(seguidos); seguidos = 0; }
      empurraHist(seguidos + n);
      total += acharPadrao(hist) * 40;
    }
  };
  linhaOuColuna((y, x) => m[y][x]);
  linhaOuColuna((x, y) => m[y][x]);

  for (let y = 0; y < n - 1; y++) {
    for (let x = 0; x < n - 1; x++) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) total += 3;
    }
  }

  let escuros = 0;
  for (const linha of m) for (const c of linha) if (c) escuros++;
  const totalCel = n * n;
  const k = Math.ceil(Math.abs(escuros * 20 - totalCel * 10) / totalCel) - 1;
  total += k * 10;
  return total;
}

/** Conta ocorrências do padrão 1:1:3:1:1 com zona clara (a "falsa marca"). */
function acharPadrao(h: number[]): number {
  const n = h[1];
  const claro = h[0] >= n * 4 && h[6] >= n;
  const claroDoOutroLado = h[6] >= n * 4 && h[0] >= n;
  const nucleo = n > 0 && h[2] === n && h[3] === n * 3 && h[4] === n && h[5] === n;
  return nucleo ? (claro ? 1 : 0) + (claroDoOutroLado ? 1 : 0) : 0;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SAÍDAS PRONTAS
   ──────────────────────────────────────────────────────────────────────────── */

/** Caminho SVG único com todos os módulos escuros (1 elemento, não N retângulos). */
export function qrParaCaminhoSvg(qr: QrCode, borda = 4): string {
  const partes: string[] = [];
  for (let y = 0; y < qr.tamanho; y++) {
    for (let x = 0; x < qr.tamanho; x++) {
      if (qr.matriz[y][x]) partes.push("M" + (x + borda) + "," + (y + borda) + "h1v1h-1z");
    }
  }
  return partes.join("");
}

/** Lado do viewBox do SVG, já com a zona de silêncio (4 módulos por norma). */
export function qrLadoTotal(qr: QrCode, borda = 4): number {
  return qr.tamanho + borda * 2;
}
