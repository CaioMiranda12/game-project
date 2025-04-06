// Estrutura base com funcionalidades completas do jogo Undercover com ordem de fala e distribuição dinâmica de classes

import { useEffect, useState } from "react";
import { distribuirClasses } from './utils/distribuirClasses'

const palavrasSecretas = ["gato", "cachorro", "carro", "praia"];

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
    console.log({ numCivis, numUndercover, numMrWhite });

    setTotalCivis(numCivis);
    setTotalUndercover(numUndercover)
    setTotalMrWhite(numMrWhite)
  }, [numeroJogadores])



  const gerarPalavras = () => {
    const sorteada = palavrasSecretas[Math.floor(Math.random() * palavrasSecretas.length)];
    const alternativa = sorteada + "a";
    setPalavra(sorteada);
    setPalavraUndercover(alternativa);
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

    let maisVotado = null;
    let votosMax = 0;
    for (let id in contagem) {
      if (contagem[id] > votosMax) {
        votosMax = contagem[id];
        maisVotado = parseInt(id);
      }
    }

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
  };

  const checarFimDeJogo = (lista) => {
    const vivos = lista.filter(j => !j.eliminado);
    const temUndercover = vivos.some(j => j.classe === "Undercover");
    const temMrWhite = vivos.some(j => j.classe === "Mr. White");

    if (!temUndercover && !temMrWhite) {
      setMsgFinal("Civis venceram!");
      setFase("fim");
    } else if (vivos.length <= 2) {
      if (temUndercover) {
        setMsgFinal("Undercover venceu!");
      } else if (temMrWhite) {
        setMsgFinal("Mr. White venceu sobrevivendo!");
      } else {
        setMsgFinal("Fim de jogo!");
      }
      setFase("fim");
    } else {
      setFase("resultado");
    }
  };

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
      <div className="p-4">
        <h1>Configurar Sala</h1>
        <input
          type="number"
          value={numeroJogadores}
          onChange={(e) => setNumeroJogadores(parseInt(e.target.value))}
        />
        <button onClick={iniciarJogo}>Iniciar</button>

        <ul>
          <li>Civis: {totalCivis}</li>
          <li>Undercovers: {totalUndercover}</li>
          <li>MrWhites: {totalMrWhite}</li>
        </ul>
      </div>
    );
  }

  if (fase === "inserirNomes") {
    return (
      <div className="p-4">
        <h2>Jogador {jogadorAtual + 1}, digite seu nome:</h2>
        <input type="text" onBlur={(e) => definirNome(e.target.value)} />
      </div>
    );
  }

  if (fase === "mostrarCarta") {
    const jogador = jogadores[jogadorAtual];

    if (!mostrandoCarta) {
      return (
        <div className="p-4">
          <h2>{jogador.nome}, clique abaixo para ver sua carta:</h2>
          <button onClick={() => setMostrandoCarta(true)}>Mostrar Carta</button>
        </div>
      );
    }

    const conteudo = jogador.classe === "Civil"
      ? palavra
      : jogador.classe === "Undercover"
        ? palavraUndercover
        : "Você é Mr. White (sem palavra)";

    return (
      <div className="p-4">
        <h2>{jogador.nome}, sua carta é:</h2>
        <p>{conteudo}</p>
        <button
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
    );
  }

  if (fase === "ordemFala") {
    const id = ordemFala[indiceFala];
    const jogador = jogadores[id];
    return (
      <div className="p-4">
        <h2>Rodada {rodada}</h2>
        <h3>Jogador da vez:</h3>
        <p>{jogador.nome}, fale uma palavra relacionada.</p>
        <button
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
    );
  }

  if (fase === "votacao") {
    const atual = jogadores[jogadorAtual];
    if (atual.eliminado) {
      setJogadorAtual(jogadorAtual + 1);
      return <div className="p-4">Pulando jogador eliminado...</div>;
    }

    return (
      <div className="p-4">
        <h2>{atual.nome}, em quem você vota?</h2>
        {jogadores.map((j) =>
          !j.eliminado && j.id !== atual.id ? (
            <button key={j.id} onClick={() => votar(j.id)}>{j.nome}</button>
          ) : null
        )}
      </div>
    );
  }

  if (fase === "resultado") {
    return (
      <div className="p-4">
        <h2>Resultado:</h2>
        <p>{resultado.nome} foi eliminado. Ele era {resultado.classe}.</p>
        <button onClick={() => {
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
      <div className="p-4">
        <h2>Fim de Jogo!</h2>
        <p>{msgFinal}</p>
        <ul>
          {jogadores.map((j) => (
            <li key={j.id}>{j.nome} - {j.classe} {j.eliminado ? "(eliminado)" : ""}</li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}
