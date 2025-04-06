// Estrutura base com funcionalidades completas do jogo Undercover com ordem de fala e distribuição dinâmica de classes

import { useEffect, useState } from "react";
import { distribuirClasses } from './utils/distribuirClasses'
import LogoUndercover from './assets/detective.png'

// const palavrasSecretas = ["gato", "cachorro", "carro", "praia"];

const bancoDePalavras = [
  { civil: "maçã", undercover: "pera" },
  { civil: "cachorro", undercover: "gato" },
  { civil: "avião", undercover: "helicóptero" },
  { civil: "praia", undercover: "piscina" },
  { civil: "garfo", undercover: "colher" },
  { civil: "carro", undercover: "moto" },
  { civil: "futebol", undercover: "vôlei" },
  { civil: "caneta", undercover: "lápis" },
  { civil: "sol", undercover: "lua" },
  { civil: "quadro", undercover: "espelho" },
  { civil: "travesseiro", undercover: "almofada" },
  { civil: "camisa", undercover: "blusa" },
  { civil: "mochila", undercover: "bolsa" },
  { civil: "janela", undercover: "porta" },
  { civil: "refrigerante", undercover: "suco" },
  { civil: "pizza", undercover: "hambúrguer" },
  { civil: "chave", undercover: "controle" },
  { civil: "óculos", undercover: "binóculo" },
  { civil: "cama", undercover: "sofá" },
  { civil: "escada", undercover: "elevador" },
  { civil: "chuveiro", undercover: "banheira" },
  { civil: "notebook", undercover: "tablet" },
  { civil: "mouse", undercover: "teclado" },
  { civil: "sapato", undercover: "chinelo" },
  { civil: "microfone", undercover: "caixa de som" },
  { civil: "abacaxi", undercover: "melancia" },
  { civil: "escola", undercover: "faculdade" },
  { civil: "médico", undercover: "enfermeiro" },
  { civil: "martelo", undercover: "chave de fenda" },
  { civil: "tesoura", undercover: "faca" },
  { civil: "polícia", undercover: "bombeiro" },
  { civil: "pintor", undercover: "escultor" },
  { civil: "ferro", undercover: "aço" },
  { civil: "leão", undercover: "tigre" },
  { civil: "tênis", undercover: "futebol" },
  { civil: "telefone", undercover: "rádio" },
  { civil: "gelo", undercover: "neve" },
  { civil: "estrela", undercover: "planeta" },
  { civil: "cachoeira", undercover: "rio" },
  { civil: "ilha", undercover: "continente" }
];


export default function App() {
  const [fase, setFase] = useState("config");
  const [jogadores, setJogadores] = useState([]);
  const [numeroJogadores, setNumeroJogadores] = useState(5);
  const [palavra, setPalavra] = useState("");
  const [palavraUndercover, setPalavraUndercover] = useState("");
  const [jogadorAtual, setJogadorAtual] = useState(0);
  const [ordemFala, setOrdemFala] = useState([]);
  const [indiceFala, setIndiceFala] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [mrWhiteChute, setMrWhiteChute] = useState("");
  const [msgFinal, setMsgFinal] = useState("");
  const [mostrandoCarta, setMostrandoCarta] = useState(false);
  const [rodada, setRodada] = useState(1);

  const [totalCivis, setTotalCivis] = useState(0);
  const [totalUndercover, setTotalUndercover] = useState(0);
  const [totalMrWhite, setTotalMrWhite] = useState(0);

  const [nomeDigitado, setNomeDigitado] = useState("");

  const [empate, setEmpate] = useState(false);
  const [empateIds, setEmpateIds] = useState([]);
  const [vencedores, setVencedores] = useState([]);

  useEffect(() => {
    const sala = localStorage.getItem("sala");
    const jogs = localStorage.getItem("jogadores");

    if (sala && jogs) {
      setNumeroJogadores(parseInt(sala));
      setJogadores(JSON.parse(jogs));
    }
  }, []);

  useEffect(() => {
    if (fase === "mostrarCarta" || fase === "votacao") {
      localStorage.setItem("jogadores", JSON.stringify(jogadores));
    }
  }, [jogadores, fase]);

  useEffect(() => {
    const { numCivis, numUndercover, numMrWhite } = distribuirClasses(numeroJogadores);

    setTotalCivis(numCivis);
    setTotalUndercover(numUndercover)
    setTotalMrWhite(numMrWhite)
  }, [numeroJogadores])


  const gerarPalavras = () => {
    const sorteada = bancoDePalavras[Math.floor(Math.random() * bancoDePalavras.length)];
    setPalavra(sorteada.civil);
    setPalavraUndercover(sorteada.undercover);
  };

  const iniciarJogo = () => {
    gerarPalavras();
    const classes = distribuirClasses(numeroJogadores);
    const listaJogadores = classes.distribuicao.map((classe, i) => ({
      id: i,
      nome: "",
      classe,
      eliminado: false,
      voto: null,
      pontos: 0,
    }));

    localStorage.setItem("sala", numeroJogadores.toString());
    setJogadores(listaJogadores);
    setFase("inserirNomes");
  };

  const definirNome = (nome) => {
    const novos = [...jogadores];
    novos[jogadorAtual].nome = nome;
    setJogadores(novos);
    setJogadorAtual(jogadorAtual + 1);
    setNomeDigitado("")
    if (jogadorAtual + 1 >= jogadores.length) {
      setJogadorAtual(0);
      setFase("mostrarCarta");
    }
  };

  const votar = (alvoId) => {
    const novos = [...jogadores];
    novos[jogadorAtual].voto = alvoId;
    setJogadores(novos);

    setJogadorAtual(jogadorAtual + 1);
    if (jogadorAtual + 1 >= jogadores.filter(j => !j.eliminado).length) {
      contarVotos();
    }
  };

  const contarVotos = () => {
    const contagem = {};
    jogadores.forEach((j) => {
      if (!j.eliminado && j.voto !== null) {
        contagem[j.voto] = (contagem[j.voto] || 0) + 1;
      }
    });

    const maxVotos = Math.max(...Object.values(contagem));
    const empatados = Object.entries(contagem)
      .filter(([_, votos]) => votos === maxVotos)
      .map(([id]) => parseInt(id));

    if (empatados.length > 1) {
      const atualizados = jogadores.map(j => ({ ...j, voto: null }));
      setJogadores(atualizados);
      setEmpate(true);
      setEmpateIds(empatados);
      setJogadorAtual(0);
      setFase("votacao");
      return;
    }

    const maisVotado = empatados[0];
    const atualizados = jogadores.map((j) => {
      if (j.id === maisVotado) return { ...j, eliminado: true };
      return j;
    });
    setJogadores(atualizados);
    setResultado(jogadores.find((j) => j.id === maisVotado));

    if (jogadores[maisVotado].classe === "Mr. White") {
      setFase("mrwhite");
    } else {
      checarFimDeJogo(atualizados);
    }
  }

  const checarFimDeJogo = (listaJogadores) => {
    const vivos = listaJogadores.filter(j => !j.eliminado);
    const civis = vivos.filter(j => j.classe === "Civil").length;
    const undercovers = vivos.filter(j => j.classe === "Undercover").length;
    const mrwhites = vivos.filter(j => j.classe === "Mr. White").length;

    if (undercovers === 0 && mrwhites === 0) {
      setFase("fim");
      setVencedores(vivos);
      return;
    }

    if (undercovers >= civis || mrwhites >= civis) {
      setFase("fim");
      setVencedores(vivos);
      return;
    }

    setFase("descricao");
    setJogadorAtual(0);
  }

  useEffect(() => {
    const dados = localStorage.getItem("jogadores");
    const faseSalva = localStorage.getItem("fase");
    if (dados) {
      setJogadores(JSON.parse(dados));
    }
    if (faseSalva) {
      setFase(faseSalva);
    }
  }, []);

  useEffect(() => {
    if (jogadores.length > 0) {
      localStorage.setItem("jogadores", JSON.stringify(jogadores));
    }
  }, [jogadores]);

  useEffect(() => {
    if (fase) {
      localStorage.setItem("fase", fase);
    }
  }, [fase]);

  const confirmarMrWhite = () => {
    if (mrWhiteChute.toLowerCase() === palavra.toLowerCase()) {
      setMsgFinal("Mr. White acertou e ganhou 8 pontos!");
    } else {
      const atualizados = jogadores.map(j =>
        j.classe === "Mr. White" ? { ...j, eliminado: true } : j
      );
      setJogadores(atualizados);
      checarFimDeJogo(atualizados);
      return;
    }
    setFase("fim");
  };

  if (fase === "config") {
    return (
      <div className="p-4 flex justify-center items-center h-screen bg-[#121212]">
        <div className="flex flex-col gap-4">
          <img
            src={LogoUndercover}
            alt="imagem da logo do undercover"
            className="w-[400px] h-[300px]"
          />

          <h1 className="text-4xl font-bold text-white">Configurar Sala</h1>
          <h3 className="text-white">Inserir número de jogadores:</h3>
          <div className="flex justify-between">
            <input
              type="number"
              value={numeroJogadores}
              onChange={(e) => setNumeroJogadores(parseInt(e.target.value))}
              className="border-white border-2 px-2 w-32 text-white"
            />
            <button
              onClick={iniciarJogo}
              className="bg-blue-400 text-white font-bold text-xl px-3 py-2 rounded-xl w-full ml-4 hover:bg-blue-500 hover:cursor-pointer"
            >
              Iniciar
            </button>
          </div>

          <ul className="text-white">
            <li>Civis: <strong>{totalCivis}</strong></li>
            <li>Undercovers: <strong>{totalUndercover}</strong></li>
            <li>MrWhites: <strong>{totalMrWhite}</strong></li>
          </ul>
        </div>
      </div>
    );
  }

  if (fase === "inserirNomes") {
    return (
      <div className="p-4 bg-[#121212] h-screen flex justify-center items-center">
        <div className="flex flex-col">efefe
          <h2 className="text-white mb-4 text-2xl">Jogador {jogadorAtual + 1}, digite seu nome:</h2>
          <input
            type="text"
            value={nomeDigitado}
            onChange={(e) => setNomeDigitado(e.target.value)}
            className="border-2 border-white text-white px-3 h-12 text-xl rounded-full"
          />

          <button
            className="bg-blue-400 py-4 text-xl font-bold text-white mt-8 rounded-full hover:cursor-pointer hover:bg-blue-500"
            onClick={() => definirNome(nomeDigitado)}
          >Confirmar</button>
        </div>
      </div>
    );
  }

  if (fase === "mostrarCarta") {
    const jogador = jogadores[jogadorAtual];

    if (!mostrandoCarta) {
      return (
        <div className="p-4 h-screen flex justify-center items-center bg-[#121212]">
          <div>
            <h2 className="mb-4 text-white text-2xl"><span className="text-4xl font-bold">{jogador.nome} </span> <br /> clique abaixo para ver sua carta:</h2>
            <button
              onClick={() => setMostrandoCarta(true)}
              className="bg-blue-400 mt-4 py-4 w-full text-xl font-bold text-white rounded-full hover:cursor-pointer hover:bg-blue-500"
            >
              Mostrar Carta
            </button>
          </div>
        </div>
      );
    }

    const conteudo = jogador.classe === "Civil"
      ? palavra
      : jogador.classe === "Undercover"
        ? palavraUndercover
        : "Você é Mr. White (sem palavra)";

    return (
      <div className="p-4 h-screen flex justify-center items-center bg-[#121212]">
        <div className="w-8/12 text-center">
          <h2 className="text-white"><span className="text-4xl font-bold">{jogador.nome} </span> <br /> <span className="text-2xl">sua palavra é:</span></h2>
          <p className="text-white text-xl mt-4">{conteudo}</p>
          <button
            className="bg-blue-400 mt-4 py-4 w-full text-xl font-bold text-white rounded-full hover:cursor-pointer hover:bg-blue-500"
            onClick={() => {
              setMostrandoCarta(false);
              if (jogadorAtual + 1 < jogadores.length) {
                setJogadorAtual(jogadorAtual + 1);
              } else {
                const jogadoresAtivos = jogadores.filter(j => !j.eliminado);
                const civisOuUndercover = jogadoresAtivos.filter(j => j.classe !== "Mr. White");

                const inicial = civisOuUndercover[Math.floor(Math.random() * civisOuUndercover.length)];
                const indiceInicial = jogadoresAtivos.findIndex(j => j.id === inicial.id);

                const ordemCircular = [
                  ...jogadoresAtivos.slice(indiceInicial),
                  ...jogadoresAtivos.slice(0, indiceInicial)
                ].map(j => j.id);

                setOrdemFala(ordemCircular);
                setIndiceFala(0);
                setFase("ordemFala");

              }
            }}
          >
            Próximo
          </button>
        </div>
      </div>
    );
  }

  if (fase === "ordemFala") {
    const id = ordemFala[indiceFala];
    const jogador = jogadores[id];
    return (
      <div className="p-4 h-screen bg-[#121212] flex justify-center items-center">
        <div>
          <h2 className="text-white text-5xl">Rodada {rodada}</h2>
          <h3 className="text-white text-3xl mt-4">Jogador da vez:</h3>
          <div className="mt-4">
            <strong className="text-white text-4xl mt-2">{jogador.nome}</strong>
            <p className="text-white text-2xl">Fale uma palavra relacionada.</p>
          </div>
          <button
            className="bg-blue-400 mt-10 py-4 w-full text-xl font-bold text-white rounded-full hover:cursor-pointer hover:bg-blue-500"
            onClick={() => {
              if (indiceFala + 1 < ordemFala.length) {
                setIndiceFala(indiceFala + 1);
              } else {
                setJogadorAtual(0);
                setRodada(rodada + 1);
                setFase("votacao");
              }
            }}
          >
            Próximo a falar
          </button>
        </div>
      </div>
    );
  }

  if (fase === "votacao") {
    const atual = jogadores[jogadorAtual];
    if (atual.eliminado) {
      setJogadorAtual(jogadorAtual + 1);
      return <div className="p-4">Pulando jogador eliminado...</div>;
    }

    return (
      <div className="p-4 h-screen bg-[#121212] flex justify-center items-center">
        <div>
          <h2 className="text-white text-2xl"><strong className="text-4xl">{atual.nome}</strong>, em quem você vota?</h2>
          <div className="mt-4 grid grid-cols-1 gap-4">
            {jogadores.map((j) =>
              !j.eliminado && j.id !== atual.id ? (
                <button
                  className="bg-blue-400 hover:bg-blue-500 p-2 rounded-full font-bold hover:cursor-pointer"
                  key={j.id}
                  onClick={() => votar(j.id)}>{j.nome}
                </button>
              ) : null
            )}
          </div>
        </div>
      </div>
    );
  }

  if (fase === "resultado") {
    return (
      <div className="p-4 h-screen flex justify-center items-center bg-[#121212]">
        <div>
          <h2 className="text-5xl text-white mb-6">Resultado:</h2>
          <p className="text-3xl text-white"><strong>{resultado.nome}</strong> foi eliminado. Ele era {resultado.classe}.</p>
          <button
            className="bg-blue-400 mt-10 py-4 w-full text-xl font-bold text-white rounded-full hover:cursor-pointer hover:bg-blue-500"
            onClick={() => {
              const vivos = jogadores.filter(j => !j.eliminado);
              const novaOrdem = [...vivos.map(j => j.id)];
              const inicio = novaOrdem.shift();
              novaOrdem.push(inicio);
              setOrdemFala(novaOrdem);
              setIndiceFala(0);
              setFase("ordemFala");
            }}>
            Próxima rodada
          </button>
        </div>
      </div>
    );
  }

  if (fase === "mrwhite") {
    return (
      <div className="p-4">
        <h2>Mr. White, qual a palavra secreta?</h2>
        <input type="text" onChange={(e) => setMrWhiteChute(e.target.value)} />
        <button onClick={confirmarMrWhite}>Confirmar</button>
      </div>
    );
  }

  if (fase === "fim") {
    return (
      <div className="p-4 h-screen flex justify-center items-center bg-[#121212]">
        <div className="border-2 border-white px-4 py-24">
          <h2 className="text-5xl text-white">Fim de Jogo!</h2>
          <p className="text-3xl mt-6 text-white">{msgFinal}</p>
          <ul className="mt-6">
            {jogadores.map((j) => (
              <li
                key={j.id}
                className="text-2xl text-white"
              >
                <strong>{j.nome}</strong> - {j.classe} {j.eliminado ? "(eliminado)" : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return null;
}
