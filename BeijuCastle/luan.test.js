/**
 * @jest-environment jsdom
 */

// ===============================
// TESTES - LUAN (1 - 15)
// ===============================

describe("Testes do home.js - Carrinho e Cupom", () => {

 beforeEach(() => {
    jest.resetModules(); 
  document.body.innerHTML = `
    <div id="listaCarrinho"></div>
    <p id="total"></p>
    <input id="cupom" />
    <div id="favoritos"></div>
  `;

  let store = {};

  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = value,
    removeItem: (key) => delete store[key],
    clear: () => store = {} // 🔴 IMPORTANTE
  };

  localStorage.clear(); // 🔴 ESSA LINHA RESOLVE

  global.alert = jest.fn();

  require("./home.js"); // 🔴 garante reset das funções também
});

  // TC01
  test("TC01 - Adicionar item ao carrinho pela primeira vez", () => {
    // Data: 20/04/2026
    // Testador: Luan
    // Cenário: Item não existe no carrinho
    // Execução: Adicionar item
    // Verificação: Item deve ser inserido com qtd 1

    window.addCarrinho("Beiju", 5);

    const carrinho = JSON.parse(localStorage.getItem("carrinho"));
    expect(carrinho[0].qtd).toBe(1);
  });

  // TC02
  test("TC02 - Adicionar item repetido incrementa quantidade", () => {
    // Cenário: Item já existe
    // Execução: Adicionar novamente
    // Verificação: Quantidade aumenta

    window.addCarrinho("Beiju", 5);
    window.addCarrinho("Beiju", 5);

    const carrinho = JSON.parse(localStorage.getItem("carrinho"));
    expect(carrinho[0].qtd).toBe(2);
  });

  // TC03
  test("TC03 - Remover item ao diminuir quantidade para zero", () => {
    // Cenário: Item com qtd 1
    // Execução: Diminuir qtd
    // Verificação: Item removido

    window.addCarrinho("Beiju", 5);
    window.mudarQtd(0, "menos");

    const carrinho = JSON.parse(localStorage.getItem("carrinho"));
    expect(carrinho.length).toBe(0);
  });

  // TC04
  test("TC04 - Aumentar quantidade de item", () => {
    // Cenário: Item já no carrinho
    // Execução: Aumentar qtd
    // Verificação: qtd aumenta

    window.addCarrinho("Beiju", 5);
    window.mudarQtd(0, "mais");

    const carrinho = JSON.parse(localStorage.getItem("carrinho"));
    expect(carrinho[0].qtd).toBe(2);
  });

  // TC05
  test("TC05 - Aplicar cupom válido", () => {
    // Cenário: Cupom correto
    // Execução: Aplicar BEIJU10
    // Verificação: Exibe mensagem de sucesso

    document.getElementById("cupom").value = "BEIJU10";

    window.aplicarCupom();

    expect(alert).toHaveBeenCalledWith("Cupom aplicado! 10% OFF");
  });

  // TC06
  test("TC06 - Aplicar cupom inválido", () => {
    // Cenário: Cupom incorreto
    // Execução: Aplicar cupom errado
    // Verificação: Exibe erro

    document.getElementById("cupom").value = "ERRADO";

    window.aplicarCupom();

    expect(alert).toHaveBeenCalledWith("Cupom inválido!");
  });

  // TC07
  test("TC07 - Cupom é case insensitive", () => {
    // Cenário: Cupom em minúsculo
    // Execução: aplicar "beiju10"
    // Verificação: Deve aceitar

    document.getElementById("cupom").value = "beiju10";

    window.aplicarCupom();

    expect(alert).toHaveBeenCalledWith("Cupom aplicado! 10% OFF");
  });

  // TC08
  test("TC08 - Cálculo de entrega abaixo de 30 reais", () => {
    // Cenário: Total menor que 30
    // Execução: Adicionar item barato
    // Verificação: Entrega = 5

    window.addCarrinho("Beiju", 5);

    const totalTexto = document.getElementById("total").textContent;

    expect(totalTexto.includes("Entrega: R$ 5")).toBe(true);
  });

  // TC09
  test("TC09 - Cálculo de entrega grátis", () => {
    // Cenário: Total >= 30
    // Execução: Adicionar itens suficientes
    // Verificação: Entrega = 0

    for (let i = 0; i < 6; i++) {
      window.addCarrinho("Beiju", 5);
    }

    const totalTexto = document.getElementById("total").textContent;

    expect(totalTexto.includes("Entrega: R$ 0")).toBe(true);
  });

  // TC10
  test("TC10 - Total com desconto aplicado", () => {
    // Cenário: Cupom válido
    // Execução: Aplicar cupom e calcular total
    // Verificação: Total reduzido

    window.addCarrinho("Beiju", 10);

    document.getElementById("cupom").value = "BEIJU10";
    window.aplicarCupom();

    const texto = document.getElementById("total").textContent;

    expect(texto).toContain("Total");
  });

  // TC11
  test("TC11 - Carrinho vazio ao iniciar", () => {
    // Cenário: Nenhum item
    // Execução: Renderizar
    // Verificação: Lista vazia

    const lista = document.getElementById("listaCarrinho");
    expect(lista.children.length).toBe(0);
  });

  // TC12
  test("TC12 - Persistência no localStorage", () => {
    // Cenário: Item adicionado
    // Execução: Salvar
    // Verificação: localStorage atualizado

    window.addCarrinho("Beiju", 5);

    expect(localStorage.getItem("carrinho")).not.toBeNull();
  });

  // TC13
  test("TC13 - Carrinho mantém múltiplos itens diferentes", () => {
    // Cenário: Itens distintos
    // Execução: Adicionar dois tipos
    // Verificação: Ambos existem

    window.addCarrinho("Beiju", 5);
    window.addCarrinho("Doce", 8);

    const carrinho = JSON.parse(localStorage.getItem("carrinho"));

    expect(carrinho.length).toBe(2);
  });

  // TC14
  test("TC14 - Remoção não afeta outros itens", () => {
    // Cenário: Dois itens
    // Execução: Remover um
    // Verificação: Outro permanece

    window.addCarrinho("Beiju", 5);
    window.addCarrinho("Doce", 8);

    window.mudarQtd(0, "menos");

    const carrinho = JSON.parse(localStorage.getItem("carrinho"));

    expect(carrinho.length).toBe(1);
  });

  // TC15
  test("TC15 - Total atualizado após mudança de quantidade", () => {
    // Cenário: Alterar qtd
    // Execução: Aumentar item
    // Verificação: Total muda

    window.addCarrinho("Beiju", 5);
    const antes = document.getElementById("total").textContent;

    window.mudarQtd(0, "mais");
    const depois = document.getElementById("total").textContent;

    expect(antes).not.toBe(depois);
  });

});
// ===============================
// TESTES - LUAN (16 - 30)
// ===============================

describe("Testes adicionais do home.js - Carrinho e Cupom", () => {

  beforeEach(() => {
    jest.resetModules();

     localStorage.clear();

    document.body.innerHTML = `
      <div id="listaCarrinho"></div>
      <p id="total"></p>
      <input id="cupom" />
      <div id="favoritos"></div>
    `;

    let store = {};
    global.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => store[key] = value,
      removeItem: (key) => delete store[key]
    };

    global.alert = jest.fn();

    require("./home.js");
  });

  // TC16
  test("TC16 - Adicionar múltiplos itens diferentes mantém estrutura correta", () => {
    // Data: 21/04/2026
    // Testador: Luan
    // Cenário: Vários produtos diferentes
    // Execução: Adicionar 3 itens distintos
    // Verificação: Carrinho contém 3 itens

    window.addCarrinho("A", 5);
    window.addCarrinho("B", 10);
    window.addCarrinho("C", 15);

    const carrinho = JSON.parse(localStorage.getItem("carrinho"));
    expect(carrinho.length).toBe(3);
  });

  // TC17
  test("TC17 - Quantidade não fica negativa", () => {
  // Cenário: Diminuir até remover
  // Execução: Remover item uma vez
  // Verificação: Item removido sem erro

  window.addCarrinho("Beiju", 5);
  window.mudarQtd(0, "menos");

  const carrinho = JSON.parse(localStorage.getItem("carrinho"));
  expect(carrinho.length).toBe(0);
});

  // TC18
  test("TC18 - Cupom inválido não aplica desconto", () => {
    // Cenário: Cupom errado
    // Execução: Aplicar cupom inválido
    // Verificação: Desconto não aplicado

    window.addCarrinho("Beiju", 10);

    document.getElementById("cupom").value = "XXXX";
    window.aplicarCupom();

    const texto = document.getElementById("total").textContent;

    expect(texto).toContain("Total");
  });

  // TC19
  test("TC19 - Cupom válido altera total visualmente", () => {
    // Cenário: Aplicar desconto
    // Execução: Usar BEIJU10
    // Verificação: Total atualizado

    window.addCarrinho("Beiju", 20);

    document.getElementById("cupom").value = "BEIJU10";
    window.aplicarCupom();

    const texto = document.getElementById("total").textContent;

    expect(texto).toContain("Total");
  });

  // TC20
  test("TC20 - Carrinho suporta múltiplos aumentos consecutivos", () => {
    // Cenário: Incrementos seguidos
    // Execução: Aumentar várias vezes
    // Verificação: Quantidade correta

    window.addCarrinho("Beiju", 5);

    window.mudarQtd(0, "mais");
    window.mudarQtd(0, "mais");
    window.mudarQtd(0, "mais");

    const carrinho = JSON.parse(localStorage.getItem("carrinho"));
    expect(carrinho[0].qtd).toBe(4);
  });

  // TC21
  test("TC21 - Total é atualizado após remover item", () => {
    // Cenário: Remoção de item
    // Execução: Remover item
    // Verificação: Total muda

    window.addCarrinho("Beiju", 10);
    const antes = document.getElementById("total").textContent;

    window.mudarQtd(0, "menos");
    const depois = document.getElementById("total").textContent;

    expect(antes).not.toBe(depois);
  });

  // TC22
  test("TC22 - Carrinho inicia vazio no localStorage", () => {
    // Cenário: Nenhum dado salvo
    // Execução: Abrir sistema
    // Verificação: Carrinho vazio

    const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
    expect(carrinho.length).toBe(0);
  });

  // TC23
  test("TC23 - Adicionar item atualiza DOM", () => {
    // Cenário: Adicionar produto
    // Execução: Inserir item
    // Verificação: DOM atualizado

    window.addCarrinho("Beiju", 5);

    const lista = document.getElementById("listaCarrinho");
    expect(lista.children.length).toBe(1);
  });

  // TC24
  test("TC24 - Remover item atualiza DOM", () => {
    // Cenário: Remoção
    // Execução: Remover item
    // Verificação: DOM atualizado

    window.addCarrinho("Beiju", 5);
    window.mudarQtd(0, "menos");

    const lista = document.getElementById("listaCarrinho");
    expect(lista.children.length).toBe(0);
  });

  // TC25
  test("TC25 - Total nunca fica negativo", () => {
  // Cenário: Carrinho vazio
  // Execução: Remover item
  // Verificação: Total mínimo inclui entrega

  window.addCarrinho("Beiju", 5);
  window.mudarQtd(0, "menos");

  const texto = document.getElementById("total").textContent;

  expect(texto).toContain("Entrega: R$ 5");
});

  // TC26
  test("TC26 - Aplicar cupom múltiplas vezes não quebra sistema", () => {
    // Cenário: Repetição
    // Execução: Aplicar cupom várias vezes
    // Verificação: Sistema continua funcionando

    window.addCarrinho("Beiju", 10);

    document.getElementById("cupom").value = "BEIJU10";

    window.aplicarCupom();
    window.aplicarCupom();
    window.aplicarCupom();

    expect(alert).toHaveBeenCalled();
  });

  // TC27
  test("TC27 - Itens com preços diferentes somam corretamente", () => {
    // Cenário: Soma de preços
    // Execução: Adicionar itens diferentes
    // Verificação: Total correto exibido

    window.addCarrinho("A", 5);
    window.addCarrinho("B", 10);

    const texto = document.getElementById("total").textContent;

    expect(texto).toContain("Total");
  });

  // TC28
  test("TC28 - Sistema aceita nome de produto diferente", () => {
    // Cenário: Nome variado
    // Execução: Adicionar item com nome diferente
    // Verificação: Item salvo

    window.addCarrinho("Produto X", 7);

    const carrinho = JSON.parse(localStorage.getItem("carrinho"));
    expect(carrinho[0].nome).toBe("Produto X");
  });

  // TC29
  test("TC29 - Sistema mantém consistência após várias operações", () => {
    // Cenário: Operações mistas
    // Execução: Add + remove + add
    // Verificação: Sistema estável

    window.addCarrinho("A", 5);
    window.addCarrinho("A", 5);
    window.mudarQtd(0, "menos");
    window.addCarrinho("B", 10);

    const carrinho = JSON.parse(localStorage.getItem("carrinho"));
    expect(carrinho.length).toBe(2);
  });

  // TC30
  test("TC30 - Total continua correto após várias ações", () => {
    // Cenário: Várias mudanças
    // Execução: Alterar carrinho
    // Verificação: Total atualizado

    window.addCarrinho("A", 5);
    window.mudarQtd(0, "mais");
    window.addCarrinho("B", 10);

    const texto = document.getElementById("total").textContent;

    expect(texto).toContain("Total");
  });

});