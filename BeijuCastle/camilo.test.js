
const {
  salvarPedido,
  listarPedidos,
  atualizarStatusPedido,
  cancelarPedido
} = require("./pedidos.js");

beforeEach(() => {
  let store = {};

  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
});

// TC01
test("TC01 - Salvar primeiro pedido", () => {
  // Data: 20/04/2026
  // Testador: Camilo
  // Cenário: Sistema sem pedidos salvos
  // Execução: Inserir um pedido no localStorage
  // Verificação: Deve existir exatamente 1 pedido salvo

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos.length).toBe(1);
});

// TC02
test("TC02 - Salvar dois pedidos", () => {
  // Data: 20/04/2026
  // Testador: Camilo
  // Cenário: Inserção de múltiplos pedidos
  // Execução: Salvar dois pedidos diferentes
  // Verificação: Deve armazenar 2 pedidos

  salvarPedido({ id: 1, usuario: "camilo" });
  salvarPedido({ id: 2, usuario: "camilo" });

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos.length).toBe(2);
});

// TC03
test("TC03 - Salvar pedido sem status", () => {
  // Cenário: Pedido incompleto
  // Execução: Salvar pedido sem campo status
  // Verificação: Deve salvar mesmo sem status

  salvarPedido({ id: 3, usuario: "camilo" });

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBeUndefined();
});

// TC04
test("TC04 - Listar pedidos do usuário correto", () => {
  // Cenário: Dois usuários diferentes
  // Execução: Filtrar pedidos de "camilo"
  // Verificação: Deve retornar apenas os pedidos dele

  salvarPedido({ id: 1, usuario: "camilo" });
  salvarPedido({ id: 2, usuario: "luan" });

  const resultado = listarPedidos("camilo");
  expect(resultado.length).toBe(1);
});

// TC05
test("TC05 - Listar pedidos inexistentes", () => {
  // Cenário: Usuário sem pedidos
  // Execução: Buscar pedidos de usuário inexistente
  // Verificação: Deve retornar lista vazia

  const resultado = listarPedidos("x");
  expect(resultado.length).toBe(0);
});

// TC06
test("TC06 - Atualizar status para 'pronto'", () => {
  // Cenário: Pedido pendente existente
  // Execução: Alterar status para pronto
  // Verificação: Status deve ser atualizado

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  atualizarStatusPedido(1, "pronto");

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBe("pronto");
});

// TC07
test("TC07 - Atualizar status inexistente", () => {
  // Cenário: ID não encontrado
  // Execução: Atualizar pedido inexistente
  // Verificação: Nenhuma alteração deve ocorrer

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  atualizarStatusPedido(999, "pronto");

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBe("pendente");
});

// TC08
test("TC08 - Cancelar pedido pendente", () => {
  // Cenário: Pedido válido
  // Execução: Cancelar pedido pendente
  // Verificação: Status deve virar cancelado

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  cancelarPedido(1);

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBe("cancelado");
});

// TC09
test("TC09 - Não cancelar pedido pronto", () => {
  // Cenário: Pedido finalizado
  // Execução: Tentar cancelar
  // Verificação: Status deve permanecer 'pronto'

  salvarPedido({ id: 1, usuario: "camilo", status: "pronto" });
  cancelarPedido(1);

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBe("pronto");
});

// TC10
test("TC10 - Cancelar pedido inexistente", () => {
  // Cenário: ID inválido
  // Execução: Cancelar pedido que não existe
  // Verificação: Nenhuma alteração

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  cancelarPedido(999);

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos.length).toBe(1);
});

// TC11
test("TC11 - Garantir isolamento entre pedidos", () => {
  // Cenário: Dois pedidos
  // Execução: Cancelar apenas um
  // Verificação: Outro deve permanecer intacto

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  salvarPedido({ id: 2, usuario: "camilo", status: "pendente" });

  cancelarPedido(1);

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[1].status).toBe("pendente");
});

// TC12
test("TC12 - Atualizar status para valor inválido", () => {
  // Cenário: Status não padrão
  // Execução: Definir status como "xyz"
  // Verificação: Deve aceitar o valor

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  atualizarStatusPedido(1, "xyz");

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBe("xyz");
});

// TC13
test("TC13 - Salvar pedido com total", () => {
  // Cenário: Pedido com valor
  // Execução: Inserir campo total
  // Verificação: Deve salvar corretamente

  salvarPedido({ id: 1, usuario: "camilo", total: 50 });

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].total).toBe(50);
});

// TC14
test("TC14 - Listar após múltiplos usuários", () => {
  // Cenário: Vários usuários
  // Execução: Filtrar por usuário específico
  // Verificação: Deve retornar somente os dele

  salvarPedido({ id: 1, usuario: "camilo" });
  salvarPedido({ id: 2, usuario: "luan" });
  salvarPedido({ id: 3, usuario: "camilo" });

  const resultado = listarPedidos("camilo");
  expect(resultado.length).toBe(2);
});

// TC15
test("TC15 - Cancelar múltiplos pedidos", () => {
  // Cenário: Dois pedidos pendentes
  // Execução: Cancelar ambos
  // Verificação: Ambos devem ficar cancelados

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  salvarPedido({ id: 2, usuario: "camilo", status: "pendente" });

  cancelarPedido(1);
  cancelarPedido(2);

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBe("cancelado");
  expect(pedidos[1].status).toBe("cancelado");
});
// TC16
test("TC16 - Salvar pedido com lista já existente", () => {
  // Cenário: Já existem pedidos salvos
  // Execução: Adicionar novo pedido
  // Verificação: Deve manter os antigos e adicionar o novo

  salvarPedido({ id: 1, usuario: "camilo" });
  salvarPedido({ id: 2, usuario: "camilo" });

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos.length).toBe(2);
});

// TC17
test("TC17 - Listar pedidos após salvar vários", () => {
  // Cenário: Múltiplos pedidos do mesmo usuário
  // Execução: Listar pedidos
  // Verificação: Deve retornar todos os pedidos

  salvarPedido({ id: 1, usuario: "camilo" });
  salvarPedido({ id: 2, usuario: "camilo" });

  const resultado = listarPedidos("camilo");
  expect(resultado.length).toBe(2);
});

// TC18
test("TC18 - Atualizar status de um entre vários pedidos", () => {
  // Cenário: Múltiplos pedidos
  // Execução: Atualizar apenas um deles
  // Verificação: Somente o selecionado deve mudar

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  salvarPedido({ id: 2, usuario: "camilo", status: "pendente" });

  atualizarStatusPedido(2, "pronto");

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[1].status).toBe("pronto");
});

// TC19
test("TC19 - Cancelar apenas um entre vários pedidos", () => {
  // Cenário: Dois pedidos pendentes
  // Execução: Cancelar apenas um
  // Verificação: Outro deve permanecer pendente

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  salvarPedido({ id: 2, usuario: "camilo", status: "pendente" });

  cancelarPedido(1);

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBe("cancelado");
  expect(pedidos[1].status).toBe("pendente");
});

// TC20
test("TC20 - Atualizar status para 'preparando'", () => {
  // Cenário: Pedido em andamento
  // Execução: Alterar para preparando
  // Verificação: Status deve ser atualizado corretamente

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  atualizarStatusPedido(1, "preparando");

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBe("preparando");
});

// TC21
test("TC21 - Cancelar pedido já cancelado", () => {
  // Cenário: Pedido já cancelado
  // Execução: Tentar cancelar novamente
  // Verificação: Status deve permanecer cancelado

  salvarPedido({ id: 1, usuario: "camilo", status: "cancelado" });
  cancelarPedido(1);

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBe("cancelado");
});

// TC22
test("TC22 - Listar pedidos após cancelamento", () => {
  // Cenário: Pedido cancelado
  // Execução: Listar pedidos do usuário
  // Verificação: Deve conter status cancelado

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  cancelarPedido(1);

  const pedidos = listarPedidos("camilo");
  expect(pedidos[0].status).toBe("cancelado");
});

// TC23
test("TC23 - Salvar pedido com ID duplicado", () => {
  // Cenário: Dois pedidos com mesmo ID
  // Execução: Salvar ambos
  // Verificação: Sistema permite duplicação

  salvarPedido({ id: 1, usuario: "camilo" });
  salvarPedido({ id: 1, usuario: "camilo" });

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos.length).toBe(2);
});

// TC24
test("TC24 - Atualizar status com ID duplicado", () => {
  // Cenário: IDs iguais
  // Execução: Atualizar status
  // Verificação: Apenas o primeiro encontrado é alterado

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });

  atualizarStatusPedido(1, "pronto");

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBe("pronto");
});

// TC25
test("TC25 - Cancelar pedido com ID duplicado", () => {
  // Cenário: IDs repetidos
  // Execução: Cancelar pedido
  // Verificação: Ambos devem ser avaliados individualmente

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });

  cancelarPedido(1);

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].status).toBe("cancelado");
});

// TC26
test("TC26 - Listar pedidos após múltiplas operações", () => {
  // Cenário: Várias ações no sistema
  // Execução: Salvar, atualizar e cancelar
  // Verificação: Lista deve refletir todas mudanças

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  atualizarStatusPedido(1, "pronto");
  cancelarPedido(1);

  const pedidos = listarPedidos("camilo");
  expect(pedidos[0].status).toBe("pronto"); // não cancela pois não está pendente
});

// TC27
test("TC27 - Salvar pedido com campo data", () => {
  // Cenário: Pedido com data
  // Execução: Inserir data no objeto
  // Verificação: Deve armazenar corretamente

  salvarPedido({ id: 1, usuario: "camilo", data: "20/04/2026" });

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].data).toBe("20/04/2026");
});

// TC28
test("TC28 - Atualizar status não altera outros campos", () => {
  // Cenário: Pedido com vários dados
  // Execução: Alterar apenas status
  // Verificação: Outros campos devem permanecer iguais

  salvarPedido({ id: 1, usuario: "camilo", total: 100, status: "pendente" });
  atualizarStatusPedido(1, "pronto");

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].total).toBe(100);
});

// TC29
test("TC29 - Cancelar pedido não altera total", () => {
  // Cenário: Pedido com valor
  // Execução: Cancelar pedido
  // Verificação: Total deve permanecer igual

  salvarPedido({ id: 1, usuario: "camilo", total: 50, status: "pendente" });
  cancelarPedido(1);

  const pedidos = JSON.parse(localStorage.getItem("pedidos"));
  expect(pedidos[0].total).toBe(50);
});

// TC30
test("TC30 - Listar pedidos após várias inserções e cancelamentos", () => {
  // Cenário: Sistema com várias operações
  // Execução: Inserir e cancelar pedidos
  // Verificação: Lista final deve refletir estados corretos

  salvarPedido({ id: 1, usuario: "camilo", status: "pendente" });
  salvarPedido({ id: 2, usuario: "camilo", status: "pendente" });

  cancelarPedido(1);

  const pedidos = listarPedidos("camilo");
  expect(pedidos.length).toBe(2);
});