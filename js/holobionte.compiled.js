// Gerado a partir do bloco React (JSX) do index.html com @babel/preset-react. Não editar à mão; edite holobionte.jsx e recompile.
const {
  useState,
  useEffect,
  useMemo
} = React;

// --- ÍCONES ---
const IconBase = ({
  children,
  className
}) => /*#__PURE__*/React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: className
}, children);
const Sun = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "5"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "1",
  x2: "12",
  y2: "3"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "21",
  x2: "12",
  y2: "23"
}), /*#__PURE__*/React.createElement("line", {
  x1: "4.22",
  y1: "4.22",
  x2: "5.64",
  y2: "5.64"
}), /*#__PURE__*/React.createElement("line", {
  x1: "18.36",
  y1: "18.36",
  x2: "19.78",
  y2: "19.78"
}), /*#__PURE__*/React.createElement("line", {
  x1: "1",
  y1: "12",
  x2: "3",
  y2: "12"
}), /*#__PURE__*/React.createElement("line", {
  x1: "21",
  y1: "12",
  x2: "23",
  y2: "12"
}), /*#__PURE__*/React.createElement("line", {
  x1: "4.22",
  y1: "19.78",
  x2: "5.64",
  y2: "18.36"
}), /*#__PURE__*/React.createElement("line", {
  x1: "18.36",
  y1: "5.64",
  x2: "19.78",
  y2: "4.22"
}));
const Moon = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("path", {
  d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
}));
const Dna = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("path", {
  d: "M2 15c6.667-6 13.333 0 20-6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 22c1.798-1.998 2.518-3.995 2.807-5.993"
}), /*#__PURE__*/React.createElement("path", {
  d: "M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"
}), /*#__PURE__*/React.createElement("path", {
  d: "M17 6l-2.5-2.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 8l-1-1"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 18l2.5 2.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3.5 14.5l1 1"
}), /*#__PURE__*/React.createElement("path", {
  d: "M20 9l-2.5 2.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14.5 16.5l1 1"
}), /*#__PURE__*/React.createElement("path", {
  d: "M11 5l-1 1"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 3l2.5 2.5"
}));
const Zap = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("polygon", {
  points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
}));
const Activity = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("path", {
  d: "M22 12h-4l-3 9L9 3l-3 9H2"
}));
const ShieldCheck = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
}), /*#__PURE__*/React.createElement("path", {
  d: "m9 12 2 2 4-4"
}));
const Sprout = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("path", {
  d: "M7 20h10"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10 20c5.5-2.5.8-6.4 3-10"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9.5 9.4c1.1.8 1.8 2.2 2.3 3.6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 20a5 5 0 0 0 5-5c0-3.35-4-6-6-6a5 5 0 0 0-5 5c0 3.35 4 6 6 6Z"
}));
const Droplets = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("path", {
  d: "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.35"
}));
const ThermometerSnowflake = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("path", {
  d: "M2 12h10"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 4v16"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 9l3 3-3 3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 6L9 9 6 6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6 18l3-3 3 3"
}), /*#__PURE__*/React.createElement("path", {
  d: "M20 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"
}));
const Microscope = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("path", {
  d: "M6 18h8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 22h18"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 22a7 7 0 1 0 0-14h-1"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 14h2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"
}));
const Layers = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("polygon", {
  points: "12 2 2 7 12 12 22 7 12 2"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "2 17 12 22 22 17"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "2 12 12 17 22 12"
}));
const ArrowRight = ({
  className
}) => /*#__PURE__*/React.createElement(IconBase, {
  className: className
}, /*#__PURE__*/React.createElement("line", {
  x1: "5",
  y1: "12",
  x2: "19",
  y2: "12"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "12 5 19 12 12 19"
}));
const CATEGORIES = {
  ALL: 'Todos',
  ECOLOGY: 'Ecologia & Futuro',
  NUTRITION: 'Nutrição Mineral',
  STRESS: 'Resiliência ao Estresse',
  BIOCONTROL: 'Biocontrole & Imunidade'
};
const data = [{
  id: 1,
  category: CATEGORIES.ECOLOGY,
  title: "1. Paradigma do Holobionte",
  icon: /*#__PURE__*/React.createElement(Dna, {
    className: "w-8 h-8 text-purple-600 dark:text-purple-400"
  }),
  shortDesc: "O 'Super-Organismo' Vegetal",
  color: "purple",
  position: {
    x: 50,
    y: 50
  },
  details: {
    concept: "Unidade Evolutiva (Hologenoma)",
    mechanism: "A planta não evolui sozinha. O genoma vegetal + metagenoma microbiano co-evoluem. Inclui a distinção entre ePGPR (extracelulares) e iPGPR (endofíticas).",
    molecular: "Rizodeposição & Exsudados: A planta investe até 30% do carbono fixado para criar um 'efeito rizosférico', secretando açúcares e flavonoides que recrutam o microbioma específico.",
    implication: "Mudar o foco de 'adubar a planta' para 'alimentar o holobionte'."
  }
}, {
  id: 2,
  category: CATEGORIES.NUTRITION,
  title: "2. Nitrogênio & Energia",
  icon: /*#__PURE__*/React.createElement(Zap, {
    className: "w-6 h-6 text-blue-600 dark:text-blue-400"
  }),
  shortDesc: "Nitrogenase e Custo de ATP",
  color: "blue",
  position: {
    x: 20,
    y: 25
  },
  details: {
    concept: "Fixação Biológica de Nitrogênio (FBN)",
    mechanism: "A enzima Nitrogenase (genes nif) quebra a tripla ligação do N₂ atmosférico, transformando-o em NH₃.",
    molecular: "Engenharia Metabólica: O processo custa 16 ATPs por molécula de N₂. Bactérias modificadas redirecionam carbono para gerar mais ATP, maximizando a fixação.",
    implication: "Uso de hemoglobinas bacterianas para gerenciar o paradoxo do oxigênio."
  }
}, {
  id: 3,
  category: CATEGORIES.NUTRITION,
  title: "3. Solubilização de Fósforo",
  icon: /*#__PURE__*/React.createElement(Activity, {
    className: "w-6 h-6 text-orange-600 dark:text-orange-400"
  }),
  shortDesc: "A via PQQ-GDH",
  color: "orange",
  position: {
    x: 80,
    y: 25
  },
  details: {
    concept: "Mineração de Fósforo",
    mechanism: "A mobilização de fósforo por microrganismos ocorre de duas formas complementares: (1) solubilização inorgânica, em que ácidos orgânicos (como o ácido glucônico derivado da enzima PQQ-GDH) acidificam a rizosfera e dissolvem fosfatos pouco solúveis; e (2) mineralização orgânica, em que enzimas como fosfatases e fitases quebram fitatos e outros compostos orgânicos, liberando fósforo para a planta.",
    molecular: "Mecanismo PQQ-GDH: A enzima Glucose Desidrogenase (cofator PQQ) oxida glucose em Ácido Glucônico. Este ácido atua como 'martelo químico'.",
    implication: "Inclui também mineralização de fitatos orgânicos via fitases."
  }
}, {
  id: 4,
  category: CATEGORIES.BIOCONTROL,
  title: "4. Sideróforos: Arma Dupla",
  icon: /*#__PURE__*/React.createElement(ShieldCheck, {
    className: "w-6 h-6 text-red-600 dark:text-red-400"
  }),
  shortDesc: "Nutrição + Biocontrole",
  color: "red",
  position: {
    x: 20,
    y: 75
  },
  details: {
    concept: "A Guerra pelo Ferro",
    mechanism: "Sideróforos são quelantes de alta afinidade que 'roubam' ferro do ambiente.",
    molecular: "Efeito Duplo: 1) Nutrem a planta (que absorve o complexo Fe-Sideróforo). 2) Matam patógenos por inanição ('fome de ferro').",
    implication: "Podem ampliar a resistência da planta a diferentes agentes bióticos (fungos, bactérias), via indução de defesas e competição por ferro."
  }
}, {
  id: 5,
  category: CATEGORIES.ECOLOGY,
  title: "5. Ajuste Fino Hormonal",
  icon: /*#__PURE__*/React.createElement(Sprout, {
    className: "w-6 h-6 text-green-600 dark:text-green-500"
  }),
  shortDesc: "IAA e Arquitetura Radicular",
  color: "green",
  position: {
    x: 80,
    y: 75
  },
  details: {
    concept: "Fitostimulação (Auxinas)",
    mechanism: "Bactérias convertem triptofano exsudado pela raiz em Ácido Indol-3-Acético (IAA).",
    molecular: "Equilíbrio Delicado: Doses ótimas de IAA bacteriano aumentam pêlos radiculares e raízes laterais. Doses excessivas inibem o crescimento.",
    implication: "Maximização da área superficial da raiz para absorção de água/nutrientes."
  }
}, {
  id: 6,
  category: CATEGORIES.STRESS,
  title: "6. ACC Desaminase",
  icon: /*#__PURE__*/React.createElement(Activity, {
    className: "w-6 h-6 text-pink-600 dark:text-pink-400"
  }),
  shortDesc: "O 'Freio' do Estresse",
  color: "pink",
  position: {
    x: 50,
    y: 15
  },
  details: {
    concept: "Alívio do Estresse de Etileno",
    mechanism: "Sob estresse (seca/sal), a planta produz etileno excessivo que trava o crescimento da raiz.",
    molecular: "Enzima ACC Desaminase (acdS): A bactéria 'come' o precursor do etileno (ACC) exsudado pela raiz, baixando os níveis internos de etileno.",
    implication: "A arma mais poderosa para manter crescimento em solos salinos ou alagados."
  }
}, {
  id: 7,
  category: CATEGORIES.STRESS,
  title: "7. Trehalose & Seca",
  icon: /*#__PURE__*/React.createElement(Droplets, {
    className: "w-6 h-6 text-cyan-600 dark:text-cyan-400"
  }),
  shortDesc: "Osmoproteção Molecular",
  color: "cyan",
  position: {
    x: 50,
    y: 85
  },
  details: {
    concept: "Resistência à Dessecação",
    mechanism: "A Trehalose é um açúcar que substitui a água nas células, prevenindo colapso de membranas ('vitrificação').",
    molecular: "Sinalização ABA: A trehalose bacteriana também induz a planta a produzir Ácido Abscísico (ABA), fechando estômatos.",
    implication: "Tecnologia vital para agricultura em climas semi-áridos."
  }
}, {
  id: 8,
  category: CATEGORIES.STRESS,
  title: "8. AFPs Bacterianas",
  icon: /*#__PURE__*/React.createElement(ThermometerSnowflake, {
    className: "w-6 h-6 text-indigo-600 dark:text-indigo-400"
  }),
  shortDesc: "Anticongelamento",
  color: "indigo",
  position: {
    x: 10,
    y: 50
  },
  details: {
    concept: "Proteção contra Geada",
    mechanism: "Bactérias psicrotolerantes secretam Proteínas de Ligação ao Gelo (AFPs) no apoplasto vegetal.",
    molecular: "Inibição de Recristalização: As AFPs impedem que microcristais de gelo cresçam e virem cristais grandes e pontiagudos que furariam as células.",
    implication: "Extensão da janela de cultivo em regiões frias."
  }
}, {
  id: 9,
  category: CATEGORIES.BIOCONTROL,
  title: "9. Imunidade (ISR)",
  icon: /*#__PURE__*/React.createElement(ShieldCheck, {
    className: "w-6 h-6 text-emerald-600 dark:text-emerald-400"
  }),
  shortDesc: "Vacinação Vegetal",
  color: "emerald",
  position: {
    x: 90,
    y: 50
  },
  details: {
    concept: "Indução de Resistência Sistêmica (ISR)",
    mechanism: "Não mata o patógeno diretamente, mas deixa o sistema imune da planta em 'alerta máximo' (Priming).",
    molecular: "Marcadores Enzimáticos: Aumenta atividade de PAL (lignina), PPO e POD (oxidantes). Mediada por Jasmonato/Etileno.",
    implication: "Proteção de amplo espectro contra vírus, bactérias e insetos."
  }
}, {
  id: 10,
  category: CATEGORIES.ECOLOGY,
  title: "10. SynComs & Futuro",
  icon: /*#__PURE__*/React.createElement(Microscope, {
    className: "w-6 h-6 text-teal-600 dark:text-teal-400"
  }),
  shortDesc: "Engenharia da Rizosfera",
  color: "teal",
  position: {
    x: 90,
    y: 90
  },
  details: {
    concept: "Comunidades Sintéticas (SynComs)",
    mechanism: "Substituir estirpes isoladas por consórcios desenhados com funções complementares (ex: Fixador de N + Solubilizador de P).",
    molecular: "Biased Rhizosphere: Plantas transgênicas que exsudam 'alimentos exclusivos' (opinas) para alimentar apenas o SynCom benéfico.",
    implication: "O fim da inconsistência dos bioinsumos em campo."
  }
}];
const Diagram = () => {
  const [selectedNode, setSelectedNode] = useState(data[0]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.ALL);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const filteredNodes = useMemo(() => {
    if (activeCategory === CATEGORIES.ALL) return data;
    return data.filter(node => node.category === activeCategory);
  }, [activeCategory]);
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen font-sans p-4 md:p-8 flex flex-col items-center selection:bg-green-500 selection:text-white  bg-slate-50 text-slate-900  dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 w-full"
  }, /*#__PURE__*/React.createElement("header", {
    className: "mb-8 text-center max-w-3xl mt-6 relative z-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 transition-colors bg-white border border-slate-200 text-green-600 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-green-400 dark:shadow-none"
  }, /*#__PURE__*/React.createElement("span", {
    className: "relative flex h-2 w-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
  }), /*#__PURE__*/React.createElement("span", {
    className: "relative inline-flex rounded-full h-2 w-2 bg-green-500"
  })), "Mapa Interativo Enriquecido"), /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-teal-500 to-blue-600 dark:from-green-400 dark:via-teal-400 dark:to-blue-500 mb-3 tracking-tight"
  }, "O Universo Oculto da Rizosfera"), /*#__PURE__*/React.createElement("p", {
    className: "text-lg leading-relaxed text-slate-600 dark:text-slate-400"
  }, "Explore os mecanismos moleculares que transformam plantas em holobiontes de alta performance.")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap justify-center gap-2 mb-8 w-full max-w-4xl relative z-10"
  }, Object.values(CATEGORIES).map(cat => /*#__PURE__*/React.createElement("button", {
    key: cat,
    onClick: () => setActiveCategory(cat),
    className: `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border
                                    ${activeCategory === cat ? 'bg-white border-green-500 text-green-600 shadow-md dark:bg-slate-800 dark:text-green-400 dark:shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-800'}
                                `
  }, cat))), /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-7xl flex flex-col lg:flex-row gap-6 items-start"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative w-full lg:w-2/3 h-[100vh] rounded-3xl shadow-2xl overflow-hidden group transition-colors duration-500 bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
  }, /*#__PURE__*/React.createElement("video", {
    src: "./assets/Looping_animation_of_202511241815.mp4",
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    className: "absolute inset-0 w-full h-full object-cover opacity-70 z-10"
  }), /*#__PURE__*/React.createElement("svg", {
    className: "absolute inset-0 w-full h-full pointer-events-none z-20"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "gradLine",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "0%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#94a3b8",
    stopOpacity: "0.3"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "50%",
    stopColor: "#22c55e",
    stopOpacity: "0.8"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#94a3b8",
    stopOpacity: "0.3"
  }))), filteredNodes.filter(n => n.id !== 1).map(node => /*#__PURE__*/React.createElement("line", {
    key: `line-${node.id}`,
    x1: `${data[0].position.x}%`,
    y1: `${data[0].position.y}%`,
    x2: `${node.position.x}%`,
    y2: `${node.position.y}%`,
    stroke: "url(#gradLine)",
    strokeWidth: "2",
    strokeDasharray: "5,5",
    className: "opacity-60 transition-all duration-700"
  }))), filteredNodes.map(node => {
    const isSelected = selectedNode.id === node.id;
    const isCenter = node.id === 1;
    return /*#__PURE__*/React.createElement("button", {
      key: node.id,
      onClick: () => setSelectedNode(node),
      className: `absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-500 group/node outline-none z-30
                                            ${isSelected ? 'scale-110' : 'scale-100 hover:scale-105 opacity-90 hover:opacity-100'}
                                        `,
      style: {
        left: `${node.position.x}%`,
        top: `${node.position.y}%`
      }
    }, isSelected && /*#__PURE__*/React.createElement("div", {
      className: `absolute inset-0 rounded-full bg-${node.color}-500 blur-xl opacity-40 animate-pulse`
    }), /*#__PURE__*/React.createElement("div", {
      className: `
                                            relative flex items-center justify-center rounded-2xl border transition-all duration-300 backdrop-blur-md shadow-lg
                                            ${isCenter ? 'w-20 h-20 md:w-24 md:h-24' : 'w-14 h-14 md:w-16 md:h-16'}
                                            ${isSelected ? `bg-white/95 border-${node.color}-500 shadow-xl shadow-${node.color}-500/40 dark:bg-slate-800/90` : `bg-white/70 border-slate-300 hover:border-${node.color}-500/50 dark:bg-slate-900/70 dark:border-slate-600`}
                                        `
    }, node.icon), /*#__PURE__*/React.createElement("div", {
      className: `
                                            mt-3 px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md border transition-all duration-300 whitespace-nowrap shadow-md
                                            ${isSelected ? `bg-white/95 text-slate-900 border-${node.color}-500/50 translate-y-0 opacity-100 dark:bg-slate-900/95 dark:text-white` : `bg-white/60 text-slate-700 border-transparent translate-y-2 opacity-0 group-hover/node:opacity-100 group-hover/node:translate-y-0 dark:bg-slate-900/60 dark:text-slate-200`}
                                            ${isMobile && !isSelected ? 'hidden' : 'block'}
                                        `
    }, node.title.split('.')[1]));
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-full lg:w-1/3 flex flex-col gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up transition-colors duration-300 bg-white/80 border border-white/50 dark:bg-slate-800/50 dark:border-slate-700/50"
  }, /*#__PURE__*/React.createElement("div", {
    className: `p-6 border-b relative overflow-hidden transition-colors duration-300
                                               border-slate-200 bg-gradient-to-br from-slate-50 to-white
                                               dark:border-slate-700/50 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900`
  }, /*#__PURE__*/React.createElement("div", {
    className: `absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2
                                                   bg-${selectedNode.color}-500/20 dark:bg-${selectedNode.color}-500/10`
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 mb-3 relative z-10"
  }, /*#__PURE__*/React.createElement("span", {
    className: `px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border
                                                        bg-${selectedNode.color}-100 text-${selectedNode.color}-700 border-${selectedNode.color}-200
                                                        dark:bg-${selectedNode.color}-500/20 dark:text-${selectedNode.color}-300 dark:border-${selectedNode.color}-500/30`
  }, selectedNode.category)), /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-bold mb-2 relative z-10 text-slate-800 dark:text-white"
  }, selectedNode.title), /*#__PURE__*/React.createElement("p", {
    className: `font-medium text-sm relative z-10 text-${selectedNode.color}-600 dark:text-${selectedNode.color}-300`
  }, selectedNode.shortDesc)), /*#__PURE__*/React.createElement("div", {
    className: "p-6 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-500"
  }, /*#__PURE__*/React.createElement(Layers, {
    className: "w-3 h-3"
  }), " Conceito Chave"), /*#__PURE__*/React.createElement("p", {
    className: "leading-relaxed text-sm text-slate-700 dark:text-slate-300"
  }, selectedNode.details.concept)), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-700/50 dark:hover:border-slate-600"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2"
  }, /*#__PURE__*/React.createElement(Microscope, {
    className: "w-3 h-3"
  }), " Mecanismo Molecular"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm leading-relaxed text-slate-700 dark:text-slate-300"
  }, selectedNode.details.molecular)), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-700/50 dark:hover:border-slate-600"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "flex items-center gap-2 text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-2"
  }, /*#__PURE__*/React.createElement(Activity, {
    className: "w-3 h-3"
  }), " Mecanismo Geral"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm leading-relaxed text-slate-700 dark:text-slate-300"
  }, selectedNode.details.mechanism)), /*#__PURE__*/React.createElement("div", {
    className: `relative pl-4 border-l-2 border-${selectedNode.color}-500/50`
  }, /*#__PURE__*/React.createElement("h3", {
    className: `flex items-center gap-2 text-xs font-bold text-${selectedNode.color}-600 dark:text-${selectedNode.color}-400 uppercase tracking-widest mb-1`
  }, /*#__PURE__*/React.createElement(Sprout, {
    className: "w-3 h-3"
  }), " Impacto Agronômico"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm italic text-slate-600 dark:text-slate-400"
  }, selectedNode.details.implication))), /*#__PURE__*/React.createElement("div", {
    className: "p-4 border-t transition-colors bg-slate-50/50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-700/50"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-xs text-slate-500"
  }, /*#__PURE__*/React.createElement("span", null, "ID: #", selectedNode.id), /*#__PURE__*/React.createElement("span", {
    className: "flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
  }, "Ver detalhes no texto ", /*#__PURE__*/React.createElement(ArrowRight, {
    className: "w-3 h-3"
  }))))))));
};
const root = ReactDOM.createRoot(document.getElementById('root-holobionte'));
root.render(/*#__PURE__*/React.createElement(Diagram, null));