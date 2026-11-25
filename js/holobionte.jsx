// RizoWiki — aba Holobionte: vídeo da rizosfera como mapa + painel de explicação.
// Escrito em JavaScript puro (React.createElement), sem etapa de compilação: este arquivo e
// holobionte.compiled.js são o MESMO código (o index carrega o .compiled.js). Edite aqui e copie para lá.
//
// Composição: o "palco" tem exatamente a proporção do vídeo (1384×1088). Vídeo, linhas (SVG) e pontos usam
// o mesmo sistema de coordenadas (porcentagem do palco), então nada desalinha ao redimensionar.
// A altura vem de --altura-util (index.html mede o cabeçalho real), e o layout escolhe lado a lado
// (tela larga/deitada) ou empilhado (celular/tablet em pé), sempre com o mapa inteiro na primeira tela.
(function () {
    const { useState, useEffect, useLayoutEffect, useMemo, useRef } = React;
    const h = React.createElement;
    const PROPORCAO = 1384 / 1088; // largura/altura do vídeo

    // --- ÍCONES (mesmos traços do original) ---
    const ico = (partes) => ({ className, style }) => h('svg', {
        xmlns: 'http://www.w3.org/2000/svg', width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, style, 'aria-hidden': true
    }, ...partes.map(([t, p], i) => h(t, Object.assign({ key: i }, p))));
    const Dna = ico([['path', { d: 'M2 15c6.667-6 13.333 0 20-6' }], ['path', { d: 'M9 22c1.798-1.998 2.518-3.995 2.807-5.993' }], ['path', { d: 'M15 2c-1.798 1.998-2.518 3.995-2.807 5.993' }], ['path', { d: 'M17 6l-2.5-2.5' }], ['path', { d: 'M14 8l-1-1' }], ['path', { d: 'M7 18l2.5 2.5' }], ['path', { d: 'M3.5 14.5l1 1' }], ['path', { d: 'M20 9l-2.5 2.5' }], ['path', { d: 'M14.5 16.5l1 1' }], ['path', { d: 'M11 5l-1 1' }], ['path', { d: 'M3 3l2.5 2.5' }]]);
    const Zap = ico([['polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }]]);
    const Activity = ico([['path', { d: 'M22 12h-4l-3 9L9 3l-3 9H2' }]]);
    const ShieldCheck = ico([['path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }], ['path', { d: 'm9 12 2 2 4-4' }]]);
    const Sprout = ico([['path', { d: 'M7 20h10' }], ['path', { d: 'M10 20c5.5-2.5.8-6.4 3-10' }], ['path', { d: 'M9.5 9.4c1.1.8 1.8 2.2 2.3 3.6' }], ['path', { d: 'M14 20a5 5 0 0 0 5-5c0-3.35-4-6-6-6a5 5 0 0 0-5 5c0 3.35 4 6 6 6Z' }]]);
    const Droplets = ico([['path', { d: 'M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z' }], ['path', { d: 'M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.35' }]]);
    const ThermometerSnowflake = ico([['path', { d: 'M2 12h10' }], ['path', { d: 'M9 4v16' }], ['path', { d: 'M3 9l3 3-3 3' }], ['path', { d: 'M12 6L9 9 6 6' }], ['path', { d: 'M6 18l3-3 3 3' }], ['path', { d: 'M20 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z' }]]);
    const Microscope = ico([['path', { d: 'M6 18h8' }], ['path', { d: 'M3 22h18' }], ['path', { d: 'M14 22a7 7 0 1 0 0-14h-1' }], ['path', { d: 'M9 14h2' }], ['path', { d: 'M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z' }], ['path', { d: 'M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3' }]]);
    const Layers = ico([['polygon', { points: '12 2 2 7 12 12 22 7 12 2' }], ['polyline', { points: '2 17 12 22 22 17' }], ['polyline', { points: '2 12 12 17 22 12' }]]);
    const Info = ico([['circle', { cx: 12, cy: 12, r: 10 }], ['path', { d: 'M12 16v-4' }], ['path', { d: 'M12 8h.01' }]]);
    const Fechar = ico([['path', { d: 'M18 6 6 18' }], ['path', { d: 'm6 6 12 12' }]]);
    const Anterior = ico([['path', { d: 'm15 18-6-6 6-6' }]]);
    const Proximo = ico([['path', { d: 'm9 18 6-6-6-6' }]]);
    const Expandir = ico([['path', { d: 'm18 15-6-6-6 6' }]]);
    const Recolher = ico([['path', { d: 'm6 9 6 6 6-6' }]]);

    const CATEGORIES = {
        ALL: 'Todos',
        ECOLOGY: 'Ecologia & Futuro',
        NUTRITION: 'Nutrição Mineral',
        STRESS: 'Resiliência ao Estresse',
        BIOCONTROL: 'Biocontrole & Imunidade'
    };
    // cor do Tailwind em hexadecimal, para as linhas do SVG
    const HEX = { purple: '#a855f7', blue: '#3b82f6', orange: '#f97316', red: '#ef4444', green: '#22c55e', pink: '#ec4899', cyan: '#06b6d4', indigo: '#6366f1', emerald: '#10b981', teal: '#14b8a6' };

    // Conteúdo idêntico ao publicado (holobionte.compiled.js até 24/11/2026). Só entraram "rotulo" (nome curto
    // que fica sempre visível no mapa) e "lado" (de que lado do ponto o rótulo aparece, para não sair do vídeo).
    const data = [
        { id: 1, category: CATEGORIES.ECOLOGY, title: "1. Paradigma do Holobionte", rotulo: "Holobionte", Icone: Dna, iconCls: "text-purple-600 dark:text-purple-400", shortDesc: "O 'Super-Organismo' Vegetal", color: "purple", position: { x: 50, y: 50 }, details: { concept: "Unidade Evolutiva (Hologenoma)", mechanism: "A planta não evolui sozinha. O genoma vegetal + metagenoma microbiano co-evoluem. Inclui a distinção entre ePGPR (extracelulares) e iPGPR (endofíticas).", molecular: "Rizodeposição & Exsudados: A planta libera pelas raízes parte do carbono que fixa, secretando açúcares e flavonoides que alimentam e recrutam os micróbios do solo.", implication: "Mudar o foco de 'adubar a planta' para 'alimentar o holobionte'." } },
        { id: 2, category: CATEGORIES.NUTRITION, title: "2. Nitrogênio & Energia", rotulo: "Nitrogênio", Icone: Zap, iconCls: "text-blue-600 dark:text-blue-400", shortDesc: "Nitrogenase e Custo de ATP", color: "blue", position: { x: 20, y: 25 }, details: { concept: "Fixação Biológica de Nitrogênio (FBN)", mechanism: "A enzima Nitrogenase (genes nif) quebra a tripla ligação do N₂ atmosférico, transformando-o em NH₃.", molecular: "Engenharia Metabólica: O processo custa 16 ATPs por molécula de N₂. Bactérias modificadas redirecionam carbono para gerar mais ATP, maximizando a fixação.", implication: "Uso de hemoglobinas bacterianas para gerenciar o paradoxo do oxigênio." } },
        { id: 3, category: CATEGORIES.NUTRITION, title: "3. Solubilização de Fósforo", rotulo: "Fósforo", Icone: Activity, iconCls: "text-orange-600 dark:text-orange-400", shortDesc: "A via PQQ-GDH", color: "orange", position: { x: 80, y: 25 }, details: { concept: "Mineração de Fósforo", mechanism: "A mobilização de fósforo por microrganismos ocorre de duas formas complementares: (1) solubilização inorgânica, em que ácidos orgânicos (como o ácido glucônico derivado da enzima PQQ-GDH) acidificam a rizosfera e dissolvem fosfatos pouco solúveis; e (2) mineralização orgânica, em que enzimas como fosfatases e fitases quebram fitatos e outros compostos orgânicos, liberando fósforo para a planta.", molecular: "Mecanismo PQQ-GDH: A enzima Glucose Desidrogenase (cofator PQQ) oxida glucose em Ácido Glucônico. Este ácido atua como 'martelo químico'.", implication: "Inclui também mineralização de fitatos orgânicos via fitases." } },
        { id: 4, category: CATEGORIES.BIOCONTROL, title: "4. Sideróforos: Arma Dupla", rotulo: "Sideróforos", Icone: ShieldCheck, iconCls: "text-red-600 dark:text-red-400", shortDesc: "Nutrição + Biocontrole", color: "red", position: { x: 20, y: 75 }, lado: 'dir', details: { concept: "A Guerra pelo Ferro", mechanism: "Sideróforos são quelantes de alta afinidade que 'roubam' ferro do ambiente.", molecular: "Efeito Duplo: 1) Nutrem a planta (que absorve o complexo Fe-Sideróforo). 2) Matam patógenos por inanição ('fome de ferro').", implication: "Podem ampliar a resistência da planta a diferentes agentes bióticos (fungos, bactérias), via indução de defesas e competição por ferro." } },
        { id: 5, category: CATEGORIES.ECOLOGY, title: "5. Ajuste Fino Hormonal", rotulo: "Hormônios", Icone: Sprout, iconCls: "text-green-600 dark:text-green-500", shortDesc: "IAA e Arquitetura Radicular", color: "green", position: { x: 80, y: 75 }, lado: 'esq', details: { concept: "Fitostimulação (Auxinas)", mechanism: "Bactérias convertem triptofano exsudado pela raiz em Ácido Indol-3-Acético (IAA).", molecular: "Equilíbrio Delicado: Doses ótimas de IAA bacteriano aumentam pêlos radiculares e raízes laterais. Doses excessivas inibem o crescimento.", implication: "Maximização da área superficial da raiz para absorção de água/nutrientes." } },
        { id: 6, category: CATEGORIES.STRESS, title: "6. ACC Desaminase", rotulo: "ACC desaminase", Icone: Activity, iconCls: "text-pink-600 dark:text-pink-400", shortDesc: "O 'Freio' do Estresse", color: "pink", position: { x: 50, y: 15 }, details: { concept: "Alívio do Estresse de Etileno", mechanism: "Sob estresse (seca/sal), a planta produz etileno excessivo que trava o crescimento da raiz.", molecular: "Enzima ACC Desaminase (acdS): A bactéria 'come' o precursor do etileno (ACC) exsudado pela raiz, baixando os níveis internos de etileno.", implication: "A arma mais poderosa para manter crescimento em solos salinos ou alagados." } },
        { id: 7, category: CATEGORIES.STRESS, title: "7. Trehalose & Seca", rotulo: "Trehalose & seca", Icone: Droplets, iconCls: "text-cyan-600 dark:text-cyan-400", shortDesc: "Osmoproteção Molecular", color: "cyan", position: { x: 50, y: 85 }, lado: 'cima', details: { concept: "Resistência à Dessecação", mechanism: "A Trehalose é um açúcar que substitui a água nas células, prevenindo colapso de membranas ('vitrificação').", molecular: "Sinalização ABA: A trehalose bacteriana também induz a planta a produzir Ácido Abscísico (ABA), fechando estômatos.", implication: "Tecnologia vital para agricultura em climas semi-áridos." } },
        { id: 8, category: CATEGORIES.STRESS, title: "8. AFPs Bacterianas", rotulo: "Anticongelamento", Icone: ThermometerSnowflake, iconCls: "text-indigo-600 dark:text-indigo-400", shortDesc: "Anticongelamento", color: "indigo", position: { x: 10, y: 50 }, details: { concept: "Proteção contra Geada", mechanism: "Bactérias psicrotolerantes secretam Proteínas de Ligação ao Gelo (AFPs) no apoplasto vegetal.", molecular: "Inibição de Recristalização: As AFPs impedem que microcristais de gelo cresçam e virem cristais grandes e pontiagudos que furariam as células.", implication: "Extensão da janela de cultivo em regiões frias." } },
        { id: 9, category: CATEGORIES.BIOCONTROL, title: "9. Imunidade (ISR)", rotulo: "Imunidade (ISR)", Icone: ShieldCheck, iconCls: "text-emerald-600 dark:text-emerald-400", shortDesc: "Vacinação Vegetal", color: "emerald", position: { x: 90, y: 50 }, details: { concept: "Indução de Resistência Sistêmica (ISR)", mechanism: "Não mata o patógeno diretamente, mas deixa o sistema imune da planta em 'alerta máximo' (Priming).", molecular: "Marcadores Enzimáticos: Aumenta atividade de PAL (lignina), PPO e POD (oxidantes). Mediada por Jasmonato/Etileno.", implication: "Proteção de amplo espectro contra vírus, bactérias e insetos." } },
        { id: 10, category: CATEGORIES.ECOLOGY, title: "10. SynComs & Futuro", rotulo: "SynComs", Icone: Microscope, iconCls: "text-teal-600 dark:text-teal-400", shortDesc: "Engenharia da Rizosfera", color: "teal", position: { x: 90, y: 90 }, lado: 'esq', details: { concept: "Comunidades Sintéticas (SynComs)", mechanism: "Substituir estirpes isoladas por consórcios desenhados com funções complementares (ex: Fixador de N + Solubilizador de P).", molecular: "Biased Rhizosphere: Plantas transgênicas que exsudam 'alimentos exclusivos' (opinas) para alimentar apenas o SynCom benéfico.", implication: "O fim da inconsistência dos bioinsumos em campo." } }
    ];
    const SUBTITULO = "Explore os mecanismos moleculares que transformam plantas em holobiontes de alta performance.";

    const modoTela = () => document.documentElement.classList.contains('modo-tela');

    // Mede uma caixa (largura/altura) e acompanha mudanças de tamanho e de orientação
    function useCaixa() {
        const ref = useRef(null);
        const [caixa, setCaixa] = useState({ w: 0, h: 0 });
        useLayoutEffect(() => {
            const el = ref.current; if (!el) return;
            const medir = () => { const r = el.getBoundingClientRect(); setCaixa(c => (Math.abs(c.w - r.width) < 1 && Math.abs(c.h - r.height) < 1) ? c : { w: r.width, h: r.height }); };
            medir();
            const ro = new ResizeObserver(medir); ro.observe(el);
            window.addEventListener('rizo-alturas', medir);
            return () => { ro.disconnect(); window.removeEventListener('rizo-alturas', medir); };
        }, []);
        return [ref, caixa];
    }

    // ---------- Mapa (palco com a proporção do vídeo) ----------
    function Mapa({ largura, nodes, ativos, sel, onSel, mostrarDica }) {
        const W = largura, H = largura / PROPORCAO;
        const escala = modoTela() ? 1.12 : 1;
        const pequeno = W < 360;                                          // celular deitado: palco bem pequeno
        const tam = Math.max(pequeno ? 30 : 36, Math.min(78, W * 0.072)) * escala; // lado do ponto (com o rótulo, a área de toque passa de 44px)
        const fonte = Math.max(pequeno ? 9.5 : 10.5, Math.min(17, W * 0.0158)) * escala;
        const centro = data[0].position;
        const px = (p) => [p.x / 100 * W, p.y / 100 * H];
        const [cx, cy] = px(centro);
        return h('div', { className: 'holo-palco relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800', style: { width: W, height: H } },
            h('video', { src: './assets/Looping_animation_of_202511241815.mp4', autoPlay: true, loop: true, muted: true, playsInline: true, className: 'absolute inset-0 w-full h-full opacity-70', style: { objectFit: 'fill' } }),
            h('svg', { className: 'absolute inset-0 pointer-events-none', width: W, height: H, viewBox: `0 0 ${W} ${H}` },
                nodes.filter(n => n.id !== 1).map(n => {
                    const [x, y] = px(n.position);
                    const on = ativos.has(n.id), eSel = sel.id === n.id;
                    return h('line', {
                        key: 'l' + n.id, x1: cx, y1: cy, x2: x, y2: y,
                        stroke: eSel ? HEX[n.color] : (on ? '#e2e8f0' : '#94a3b8'),
                        strokeOpacity: eSel ? 0.95 : (on ? 0.55 : 0.15), strokeWidth: eSel ? 3 : 1.6,
                        strokeDasharray: '6 6', className: eSel ? 'holo-fluxo' : '', style: { transition: 'stroke .4s, stroke-opacity .4s' }
                    });
                })
            ),
            nodes.map(n => {
                const [x, y] = px(n.position);
                const eSel = sel.id === n.id, on = ativos.has(n.id), centro = n.id === 1;
                const s = centro ? tam * (pequeno ? 1.15 : 1.3) : tam;
                // rótulo: abaixo (padrão) ou acima; encostado na borda quando o ponto está perto dela
                let estiloRot;
                const lado = (W < 600 && n.lado === 'cima') ? 'baixo' : n.lado;   // palco estreito: em cima o rótulo bate nos de Sideróforos/Hormônios; embaixo sobra espaço
                if (lado === 'esq' || lado === 'dir') estiloRot = { fontSize: fonte, [lado === 'esq' ? 'right' : 'left']: s + 6, top: '50%', transform: 'translateY(-50%)' };
                else {
                    estiloRot = { fontSize: fonte, [lado === 'cima' ? 'bottom' : 'top']: s + 6 };
                    if (n.position.x <= 15) estiloRot.left = 0; else if (n.position.x >= 85) estiloRot.right = 0; else { estiloRot.left = '50%'; estiloRot.transform = 'translateX(-50%)'; }
                }
                return h('button', {
                    key: n.id, type: 'button', onClick: () => onSel(n), 'aria-label': n.title, 'aria-pressed': eSel,
                    className: 'holo-no absolute outline-none' + (on ? '' : ' holo-apagado'),
                    style: { left: x - s / 2, top: y - s / 2, width: s, height: s, zIndex: eSel ? 6 : (centro ? 5 : 4) }
                },
                    eSel && h('span', { className: `absolute inset-0 rounded-full bg-${n.color}-500 blur-xl opacity-40 animate-pulse` }),
                    h('span', {
                        className: 'relative flex items-center justify-center w-full h-full rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 ' +
                            (eSel ? `bg-white/95 border-${n.color}-500 shadow-xl shadow-${n.color}-500/40 dark:bg-slate-800/90 scale-110` : `bg-white/70 border-slate-300 dark:bg-slate-900/70 dark:border-slate-600 hover:scale-105`)
                    }, h(n.Icone, { className: n.iconCls, style: { width: s * 0.46, height: s * 0.46 } })),
                    h('span', {
                        className: 'holo-rotulo absolute whitespace-nowrap rounded-lg font-bold backdrop-blur-md border shadow-md pointer-events-none ' +
                            (eSel ? `bg-white/95 text-slate-900 border-${n.color}-500/60 dark:bg-slate-900/95 dark:text-white` : 'bg-white/75 text-slate-800 border-white/40 dark:bg-slate-900/70 dark:text-slate-100 dark:border-slate-700/60'),
                        style: estiloRot
                    }, n.rotulo)
                );
            }),
            mostrarDica && h('div', { className: 'holo-dica absolute left-3 top-3 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur pointer-events-none', style: { background: 'rgba(15,23,42,.72)', color: '#fff', zIndex: 8 } }, 'Toque num ponto para explorar')
        );
    }

    // ---------- Painel de explicação ----------
    function Painel({ node, lista, onSel, modo, onModo, empilhado }) {
        const i = lista.findIndex(n => n.id === node.id);
        const ir = (d) => { if (!lista.length) return; const k = ((i < 0 ? 0 : i) + d + lista.length) % lista.length; onSel(lista[k]); };
        const c = node.color;
        const fechado = empilhado && modo === 'fechado';
        const botoesCelular = empilhado && h('div', { className: 'flex items-center gap-1 shrink-0' },
            !fechado && h('button', { type: 'button', className: 'holo-btn', onClick: () => onModo(modo === 'expandido' ? 'aberto' : 'expandido'), 'aria-label': modo === 'expandido' ? 'Recolher painel' : 'Ampliar painel' }, h(modo === 'expandido' ? Recolher : Expandir, { className: 'w-5 h-5' })),
            h('button', { type: 'button', className: 'holo-btn', onClick: () => onModo(fechado ? 'aberto' : 'fechado'), 'aria-label': fechado ? 'Abrir painel' : 'Fechar painel' }, h(fechado ? Expandir : Fechar, { className: 'w-5 h-5' }))
        );
        return h('div', { className: 'holo-painel flex flex-col h-full backdrop-blur-xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-white/85 border border-white/50 dark:bg-slate-800/60 dark:border-slate-700/50' },
            // cabeçalho: nome + ideia principal
            h('div', { className: 'holo-pcab relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-900' },
                h('div', { className: `absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 bg-${c}-500/20 dark:bg-${c}-500/10` }),
                h('div', { className: 'relative z-10 flex items-start gap-3' },
                    h('div', { className: 'min-w-0 flex-1' },
                        h('span', { className: `inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border bg-${c}-100 text-${c}-700 border-${c}-200 dark:bg-${c}-500/20 dark:text-${c}-300 dark:border-${c}-500/30` }, node.category),
                        h('h2', { className: 'holo-ptit font-bold mt-2 text-slate-800 dark:text-white leading-tight' }, node.title),
                        h('p', { className: `holo-psub font-medium mt-1 text-${c}-600 dark:text-${c}-300` }, node.shortDesc)
                    ),
                    botoesCelular
                )
            ),
            // corpo: conceito + explicação curta; detalhes moleculares e impacto ficam em seções que abrem
            !fechado && h('div', { className: 'holo-pcorpo flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4' },
                h('div', null,
                    h('h3', { className: 'holo-psec text-slate-500' }, h(Layers, { className: 'w-3.5 h-3.5' }), 'Conceito chave'),
                    h('p', { className: 'holo-ptxt font-semibold text-slate-800 dark:text-slate-100' }, node.details.concept)
                ),
                h('div', null,
                    h('h3', { className: 'holo-psec text-yellow-600 dark:text-yellow-400' }, h(Activity, { className: 'w-3.5 h-3.5' }), 'Mecanismo geral'),
                    h('p', { className: 'holo-ptxt text-slate-700 dark:text-slate-300' }, node.details.mechanism)
                ),
                h('details', { key: 'm' + node.id, className: 'holo-det' },
                    h('summary', { className: 'holo-psec text-blue-600 dark:text-blue-400' }, h(Microscope, { className: 'w-3.5 h-3.5' }), 'Mecanismo molecular'),
                    h('p', { className: 'holo-ptxt text-slate-700 dark:text-slate-300' }, node.details.molecular)
                ),
                h('details', { key: 'i' + node.id, className: 'holo-det', style: { borderLeftColor: HEX[c] } },
                    h('summary', { className: `holo-psec text-${c}-600 dark:text-${c}-400` }, h(Sprout, { className: 'w-3.5 h-3.5' }), 'Impacto agronômico'),
                    h('p', { className: 'holo-ptxt italic text-slate-600 dark:text-slate-400' }, node.details.implication)
                )
            ),
            // rodapé: percorrer os pontos sem voltar ao mapa (útil na tela interativa)
            !fechado && h('div', { className: 'holo-prod flex items-center justify-between border-t border-slate-200 bg-slate-50/60 dark:bg-slate-900/30 dark:border-slate-700/50 text-slate-500' },
                h('button', { type: 'button', className: 'holo-btn', onClick: () => ir(-1), 'aria-label': 'Anterior' }, h(Anterior, { className: 'w-5 h-5' })),
                h('span', { className: 'text-xs font-semibold tracking-wide' }, `${i + 1} de ${lista.length}`),
                h('button', { type: 'button', className: 'holo-btn', onClick: () => ir(1), 'aria-label': 'Próximo' }, h(Proximo, { className: 'w-5 h-5' }))
            )
        );
    }

    // ---------- Aba ----------
    const Diagram = () => {
        const [selectedNode, setSelectedNode] = useState(data[0]);
        const [activeCategory, setActiveCategory] = useState(CATEGORIES.ALL);
        const [ajuda, setAjuda] = useState(false);
        const [modoPainel, setModoPainel] = useState('aberto');   // aberto | expandido | fechado (celular)
        const [tocou, setTocou] = useState(false);
        const [areaRef, area] = useCaixa();

        const ativos = useMemo(() => new Set((activeCategory === CATEGORIES.ALL ? data : data.filter(n => n.category === activeCategory)).map(n => n.id)), [activeCategory]);
        const lista = useMemo(() => data.filter(n => ativos.has(n.id)), [ativos]);

        const escolher = (n) => { setSelectedNode(n); setTocou(true); if (modoPainel === 'fechado') setModoPainel('aberto'); };
        const filtrar = (cat) => {
            setActiveCategory(cat);
            const novos = cat === CATEGORIES.ALL ? data : data.filter(n => n.category === cat);
            if (!novos.some(n => n.id === selectedNode.id)) setSelectedNode(novos[0]);
        };

        // Layout: lado a lado quando a área é larga (deitada); empilhado em celular/tablet em pé
        const GAP = 16;
        const lado = area.w >= 640 && area.w / Math.max(1, area.h) >= 1.15;
        let palcoW = 0;
        if (area.w > 0) {
            if (lado) palcoW = Math.min(area.w * 0.65, area.h * PROPORCAO);
            else palcoW = Math.min(area.w, Math.max(200, area.h - (modoPainel === 'fechado' ? 70 : 230)) * PROPORCAO);
        }
        const palcoH = palcoW / PROPORCAO;
        const painelW = lado ? Math.min(area.w - palcoW - GAP, Math.max(380, palcoW * 0.62)) : palcoW;

        const filtros = h('div', { className: 'holo-filtros' + (lado ? '' : ' holo-filtros-faixa') },
            Object.values(CATEGORIES).map(cat => h('button', {
                key: cat, type: 'button', onClick: () => filtrar(cat), 'aria-pressed': activeCategory === cat,
                className: 'holo-chip border transition-all duration-300 ' + (activeCategory === cat
                    ? 'bg-white border-green-500 text-green-600 shadow-md dark:bg-slate-800 dark:text-green-400 dark:shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                    : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-800')
            }, cat))
        );

        const painel = h(Painel, { node: selectedNode, lista, onSel: escolher, modo: modoPainel, onModo: setModoPainel, empilhado: !lado });

        return h('div', { className: 'holo-raiz font-sans flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 w-full' },
            // título numa linha + ajuda (o subtítulo foi para a ajuda) + filtros
            h('header', { className: 'holo-topo relative z-20' + (lado ? ' holo-topo-lado' : '') },
                h('div', { className: 'flex items-center gap-2 min-w-0' },
                    h('h1', { className: 'holo-h1 font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-teal-500 to-blue-600 dark:from-green-400 dark:via-teal-400 dark:to-blue-500 tracking-tight' }, 'O Universo Oculto da Rizosfera'),
                    h('button', { type: 'button', className: 'holo-btn holo-btn-ajuda text-slate-500 dark:text-slate-400', onClick: () => setAjuda(a => !a), 'aria-expanded': ajuda, 'aria-label': 'Sobre este mapa' }, h(Info, { className: 'w-5 h-5' })),
                    ajuda && h('div', { className: 'holo-ajuda absolute left-0 top-full mt-2 max-w-md p-4 rounded-2xl shadow-2xl border bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700', onClick: () => setAjuda(false) },
                        h('p', { className: 'text-sm leading-relaxed' }, SUBTITULO),
                        h('p', { className: 'text-sm leading-relaxed mt-2 text-slate-500 dark:text-slate-400' }, 'Toque num ponto do vídeo para ler a explicação ao lado. Os filtros destacam um tema; as seções "Mecanismo molecular" e "Impacto agronômico" abrem com um toque.')
                    )
                ),
                filtros
            ),
            // área útil: mapa + painel
            h('div', { ref: areaRef, className: 'holo-area flex-1 min-h-0' },
                palcoW > 0 && h('div', { className: 'flex ' + (lado ? 'flex-row items-start justify-center' : 'flex-col items-center'), style: { gap: lado ? GAP : 10, height: '100%' } },
                    h(Mapa, { largura: palcoW, nodes: data, ativos, sel: selectedNode, onSel: escolher, mostrarDica: !tocou && palcoW >= 520 }),
                    lado
                        ? h('div', { style: { width: painelW, height: palcoH } }, painel)
                        : h('div', { className: 'holo-painel-pilha' + (modoPainel === 'expandido' ? ' holo-folha' : ''), style: modoPainel === 'expandido' ? {} : { width: palcoW, flex: modoPainel === 'fechado' ? '0 0 auto' : '1 1 0', minHeight: modoPainel === 'fechado' ? 0 : 170 } }, painel),
                    !lado && modoPainel === 'expandido' && h('div', { className: 'holo-veu', onClick: () => setModoPainel('aberto') })
                )
            )
        );
    };

    const root = ReactDOM.createRoot(document.getElementById('root-holobionte'));
    root.render(h(Diagram));
})();
