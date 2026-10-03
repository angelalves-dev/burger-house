/* =========================================================
   BURGER HOUSE
   SCRIPT PRINCIPAL
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const TAXA_ENTREGA = 5;
const CHAVE_CARRINHO = "burgerHouseCarrinho";

let carrinho = [];



/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    carregarCarrinho();

    atualizarCarrinho();

    alterarTipoPedido();

    configurarMenuMobile();

    configurarTipoPedido();

    configurarFechamentoModal();

});



/* =========================================================
   MENU MOBILE
========================================================= */

function alternarMenu() {

    const menu = document.getElementById("menu");

    if (!menu) return;

    menu.classList.toggle("aberto");

}


/* Fecha o menu ao clicar em algum link */

function configurarMenuMobile() {

    const menu = document.getElementById("menu");

    if (!menu) return;

    const links = menu.querySelectorAll("a");

    links.forEach(link => {

        link.addEventListener("click", () => {

            menu.classList.remove("aberto");

        });

    });

}



/* =========================================================
   CARRINHO — LOCAL STORAGE
========================================================= */

function salvarCarrinho() {

    try {

        localStorage.setItem(
            CHAVE_CARRINHO,
            JSON.stringify(carrinho)
        );

    } catch (erro) {

        console.error(
            "Não foi possível salvar o carrinho:",
            erro
        );

    }

}


function carregarCarrinho() {

    try {

        const dados =
            localStorage.getItem(CHAVE_CARRINHO);

        if (!dados) {

            carrinho = [];

            return;

        }

        const carrinhoSalvo =
            JSON.parse(dados);

        if (Array.isArray(carrinhoSalvo)) {

            carrinho = carrinhoSalvo.filter(item =>

                item &&
                typeof item.nome === "string" &&
                typeof item.preco === "number" &&
                typeof item.quantidade === "number" &&
                item.quantidade > 0

            );

        } else {

            carrinho = [];

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar carrinho:",
            erro
        );

        carrinho = [];

    }

}



/* =========================================================
   ADICIONAR AO CARRINHO
========================================================= */

function adicionarCarrinho(nome, preco) {

    if (!nome || typeof preco !== "number") {

        return;

    }

    const produtoExistente =
        carrinho.find(
            item => item.nome === nome
        );


    if (produtoExistente) {

        produtoExistente.quantidade++;

    } else {

        carrinho.push({

            nome: nome,

            preco: preco,

            quantidade: 1

        });

    }


    salvarCarrinho();

    atualizarCarrinho();

    mostrarToast();

    abrirCarrinho();

}



/* =========================================================
   ATUALIZAR CARRINHO
========================================================= */

function atualizarCarrinho() {

    const container =
        document.getElementById(
            "itensCarrinho"
        );

    const quantidadeElemento =
        document.getElementById(
            "quantidadeCarrinho"
        );

    const subtotalElemento =
        document.getElementById(
            "subtotal"
        );

    const taxaElemento =
        document.getElementById(
            "taxaCarrinho"
        );

    const totalElemento =
        document.getElementById(
            "totalCarrinho"
        );


    if (!container) return;


    let totalItens = 0;

    let subtotal = 0;


    carrinho.forEach(item => {

        totalItens += item.quantidade;

        subtotal +=
            item.preco *
            item.quantidade;

    });


    if (quantidadeElemento) {

        quantidadeElemento.textContent =
            totalItens;

    }


    const tipoPedido =
        document.querySelector(
            'input[name="tipoPedido"]:checked'
        );


    const entregaSelecionada =
        tipoPedido &&
        tipoPedido.value === "Entrega";


    const taxa =
        entregaSelecionada &&
        carrinho.length > 0
            ? TAXA_ENTREGA
            : 0;


    const total =
        subtotal + taxa;


    if (subtotalElemento) {

        subtotalElemento.textContent =
            formatarMoeda(subtotal);

    }


    if (taxaElemento) {

        taxaElemento.textContent =
            formatarMoeda(taxa);

    }


    if (totalElemento) {

        totalElemento.textContent =
            formatarMoeda(total);

    }


    /* Carrinho vazio */

    if (carrinho.length === 0) {

        container.innerHTML = `

            <div class="carrinho-vazio">

                <span>🍔</span>

                <h3>
                    Seu carrinho está vazio
                </h3>

                <p>
                    Adicione alguns produtos deliciosos.
                </p>

            </div>

        `;

        return;

    }


    /* Renderizar produtos */

    container.innerHTML = "";


    carrinho.forEach((item, index) => {

        const elemento =
            document.createElement("div");


        elemento.className =
            "item-carrinho";


        elemento.innerHTML = `

            <div class="item-info">

                <h3>
                    ${escaparHTML(item.nome)}
                </h3>

                <p>
                    ${formatarMoeda(item.preco)}
                </p>

                <div class="controle-quantidade">

                    <button
                        type="button"
                        onclick="alterarQuantidade(${index}, -1)"
                        aria-label="Diminuir quantidade"
                    >
                        -
                    </button>

                    <span>
                        ${item.quantidade}
                    </span>

                    <button
                        type="button"
                        onclick="alterarQuantidade(${index}, 1)"
                        aria-label="Aumentar quantidade"
                    >
                        +
                    </button>

                    <button
                        type="button"
                        class="btn-remover"
                        onclick="removerProduto(${index})"
                    >
                        Remover
                    </button>

                </div>

            </div>

        `;


        container.appendChild(elemento);

    });

}



/* =========================================================
   ALTERAR QUANTIDADE
========================================================= */

function alterarQuantidade(index, valor) {

    if (
        !Number.isInteger(index) ||
        !carrinho[index]
    ) {

        return;

    }


    carrinho[index].quantidade += valor;


    if (carrinho[index].quantidade <= 0) {

        carrinho.splice(index, 1);

    }


    salvarCarrinho();

    atualizarCarrinho();

}



/* =========================================================
   REMOVER PRODUTO
========================================================= */

function removerProduto(index) {

    if (
        !Number.isInteger(index) ||
        !carrinho[index]
    ) {

        return;

    }


    carrinho.splice(index, 1);


    salvarCarrinho();

    atualizarCarrinho();

}



/* =========================================================
   MOEDA
========================================================= */

function formatarMoeda(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}



/* =========================================================
   CALCULAR SUBTOTAL
========================================================= */

function calcularSubtotal() {

    return carrinho.reduce(
        (total, item) => {

            return total +
                item.preco *
                item.quantidade;

        },
        0
    );

}



/* =========================================================
   CALCULAR TOTAL
========================================================= */

function calcularTotal() {

    const subtotal =
        calcularSubtotal();


    const tipo =
        document.querySelector(
            'input[name="tipoPedido"]:checked'
        );


    const taxa =
        tipo &&
        tipo.value === "Entrega"
            ? TAXA_ENTREGA
            : 0;


    return subtotal + taxa;

}



/* =========================================================
   ABRIR CARRINHO
========================================================= */

function abrirCarrinho() {

    const carrinhoElemento =
        document.getElementById("carrinho");

    const overlay =
        document.getElementById("overlay");


    if (carrinhoElemento) {

        carrinhoElemento.classList.add("aberto");

    }


    if (overlay) {

        overlay.classList.add("ativo");

    }


    document.body.style.overflow =
        "hidden";

}



/* =========================================================
   FECHAR CARRINHO
========================================================= */

function fecharCarrinho() {

    const carrinhoElemento =
        document.getElementById("carrinho");

    const overlay =
        document.getElementById("overlay");


    if (carrinhoElemento) {

        carrinhoElemento.classList.remove("aberto");

    }


    if (overlay) {

        overlay.classList.remove("ativo");

    }


    /* Só libera o scroll se o checkout também estiver fechado */

    const modalCheckout =
        document.getElementById("modalCheckout");


    if (
        !modalCheckout ||
        !modalCheckout.classList.contains("ativo")
    ) {

        document.body.style.overflow = "";

    }

}



/* =========================================================
   CHECKOUT
========================================================= */

function abrirCheckout() {

    if (carrinho.length === 0) {

        alert(
            "Adicione pelo menos um produto ao carrinho."
        );

        return;

    }


    fecharCarrinho();

    atualizarResumoCheckout();


    const modal =
        document.getElementById(
            "modalCheckout"
        );


    if (!modal) return;


    modal.classList.add("ativo");


    document.body.style.overflow =
        "hidden";

}



/* =========================================================
   FECHAR CHECKOUT
========================================================= */

function fecharCheckout() {

    const modal =
        document.getElementById(
            "modalCheckout"
        );


    if (modal) {

        modal.classList.remove("ativo");

    }


    document.body.style.overflow =
        "";

}



/* =========================================================
   RESUMO CHECKOUT
========================================================= */

function atualizarResumoCheckout() {

    const subtotal =
        calcularSubtotal();


    const tipo =
        document.querySelector(
            'input[name="tipoPedido"]:checked'
        );


    const taxa =
        tipo &&
        tipo.value === "Entrega"
            ? TAXA_ENTREGA
            : 0;


    const total =
        subtotal + taxa;


    const checkoutSubtotal =
        document.getElementById(
            "checkoutSubtotal"
        );

    const checkoutEntrega =
        document.getElementById(
            "checkoutEntrega"
        );

    const totalCheckout =
        document.getElementById(
            "totalCheckout"
        );


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            formatarMoeda(subtotal);

    }


    if (checkoutEntrega) {

        checkoutEntrega.textContent =
            formatarMoeda(taxa);

    }


    if (totalCheckout) {

        totalCheckout.textContent =
            formatarMoeda(total);

    }

}



/* =========================================================
   TIPO DE PEDIDO
========================================================= */

function alterarTipoPedido() {

    const tipoSelecionado =
        document.querySelector(
            'input[name="tipoPedido"]:checked'
        );


    const campoEndereco =
        document.getElementById(
            "campoEndereco"
        );


    const endereco =
        document.getElementById(
            "endereco"
        );


    if (!tipoSelecionado) {

        return;

    }


    const tipo =
        tipoSelecionado.value;


    if (tipo === "Retirada") {

        if (campoEndereco) {

            campoEndereco.style.display =
                "none";

        }


        if (endereco) {

            endereco.required =
                false;

        }

    } else {

        if (campoEndereco) {

            campoEndereco.style.display =
                "block";

        }


        if (endereco) {

            endereco.required =
                true;

        }

    }


    atualizarCarrinho();

    atualizarResumoCheckout();

}



/* =========================================================
   CONFIGURAR TIPO DE PEDIDO
========================================================= */

function configurarTipoPedido() {

    const tipos =
        document.querySelectorAll(
            'input[name="tipoPedido"]'
        );


    tipos.forEach(tipo => {

        tipo.addEventListener(
            "change",
            alterarTipoPedido
        );

    });

}



/* =========================================================
   FILTRAR PRODUTOS
========================================================= */

function filtrarProdutos(
    categoria,
    botao
) {

    const produtos =
        document.querySelectorAll(
            ".produto"
        );


    const filtros =
        document.querySelectorAll(
            ".filtro"
        );


    filtros.forEach(filtro => {

        filtro.classList.remove("ativo");

    });


    if (botao) {

        botao.classList.add("ativo");

    }


    /* Guardar filtro atual */

    window.categoriaAtual =
        categoria;


    aplicarFiltros();

}



/* =========================================================
   BUSCAR PRODUTOS
========================================================= */

function buscarProdutos() {

    aplicarFiltros();

}



/* =========================================================
   APLICAR BUSCA + FILTRO
========================================================= */

function aplicarFiltros() {

    const campoBusca =
        document.getElementById(
            "campoBusca"
        );


    const busca =
        campoBusca
            ? campoBusca.value
                .toLowerCase()
                .trim()
            : "";


    const categoria =
        window.categoriaAtual ||
        "todos";


    const produtos =
        document.querySelectorAll(
            ".produto"
        );


    let encontrados = 0;


    produtos.forEach(produto => {

        const categoriaProduto =
            (
                produto.dataset.categoria ||
                ""
            ).toLowerCase();


        const nome =
            (
                produto.dataset.nome ||
                produto.textContent ||
                ""
            ).toLowerCase();


        const correspondeCategoria =
            categoria === "todos" ||
            categoriaProduto === categoria;


        const correspondeBusca =
            nome.includes(busca);


        if (
            correspondeCategoria &&
            correspondeBusca
        ) {

            produto.style.display =
                "";

            encontrados++;

        } else {

            produto.style.display =
                "none";

        }

    });


    mostrarSemResultados(
        encontrados
    );

}



/* =========================================================
   SEM RESULTADOS
========================================================= */

function mostrarSemResultados(
    quantidade
) {

    const mensagem =
        document.getElementById(
            "semResultados"
        );


    if (!mensagem) return;


    if (quantidade === 0) {

        mensagem.style.display =
            "block";

    } else {

        mensagem.style.display =
            "none";

    }

}



/* =========================================================
   TOAST
========================================================= */

function mostrarToast() {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) return;


    toast.classList.add(
        "mostrar"
    );


    setTimeout(() => {

        toast.classList.remove(
            "mostrar"
        );

    }, 1800);

}



/* =========================================================
   ENVIAR PEDIDO PELO WHATSAPP
========================================================= */

function configurarFormularioPedido() {

    const formulario =
        document.getElementById(
            "formPedido"
        );


    if (!formulario) return;


    formulario.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            if (carrinho.length === 0) {

                alert(
                    "Seu carrinho está vazio."
                );

                return;

            }


            const nome =
                obterValorCampo("nome");


            const telefone =
                obterValorCampo("telefone");


            const tipoSelecionado =
                document.querySelector(
                    'input[name="tipoPedido"]:checked'
                );


            if (!tipoSelecionado) {

                alert(
                    "Selecione se o pedido será para entrega ou retirada."
                );

                return;

            }


            const tipo =
                tipoSelecionado.value;


            const endereco =
                obterValorCampo("endereco");


            const observacao =
                obterValorCampo("observacao");


            /* Validação */

            if (!nome) {

                alert(
                    "Informe seu nome."
                );

                document.getElementById(
                    "nome"
                )?.focus();

                return;

            }


            if (!telefone) {

                alert(
                    "Informe seu WhatsApp."
                );

                document.getElementById(
                    "telefone"
                )?.focus();

                return;

            }


            if (
                tipo === "Entrega" &&
                !endereco
            ) {

                alert(
                    "Informe o endereço de entrega."
                );

                document.getElementById(
                    "endereco"
                )?.focus();

                return;

            }


            const subtotal =
                calcularSubtotal();


            const taxa =
                tipo === "Entrega"
                    ? TAXA_ENTREGA
                    : 0;


            const total =
                subtotal + taxa;


            /* =================================================
               MONTAR MENSAGEM
            ================================================= */

            let mensagem =
                "🍔 *NOVO PEDIDO - BURGER HOUSE*\n\n";


            mensagem +=
                "*Cliente:* " +
                nome +
                "\n";


            mensagem +=
                "*WhatsApp:* " +
                telefone +
                "\n";


            mensagem +=
                "*Tipo:* " +
                tipo +
                "\n";


            if (tipo === "Entrega") {

                mensagem +=
                    "*Endereço:* " +
                    endereco +
                    "\n";

            }


            mensagem +=
                "\n*PEDIDO:*\n";


            carrinho.forEach(item => {

                mensagem +=
                    "• " +
                    item.quantidade +
                    "x " +
                    item.nome +
                    " - " +
                    formatarMoeda(
                        item.preco *
                        item.quantidade
                    ) +
                    "\n";

            });


            mensagem +=
                "\n*Subtotal:* " +
                formatarMoeda(subtotal);


            mensagem +=
                "\n*Entrega:* " +
                formatarMoeda(taxa);


            mensagem +=
                "\n*TOTAL:* " +
                formatarMoeda(total);


            if (observacao) {

                mensagem +=
                    "\n\n*Observação:* " +
                    observacao;

            }


            /* =================================================
               WHATSAPP
            ================================================= */

            /*
                TROQUE PELO WHATSAPP REAL
                DA HAMBURGUERIA.
            */

            const numeroWhatsApp =
                "5592999999999";


            const mensagemCodificada =
                encodeURIComponent(
                    mensagem
                );


            const url =
                "https://wa.me/" +
                numeroWhatsApp +
                "?text=" +
                mensagemCodificada;


            window.open(
                url,
                "_blank"
            );

        }
    );

}



/* =========================================================
   OBTER VALOR DE CAMPO
========================================================= */

function obterValorCampo(id) {

    const campo =
        document.getElementById(id);


    if (!campo) {

        return "";

    }


    return campo.value
        .trim();

}



/* =========================================================
   FECHAMENTO DE MODAIS
========================================================= */

function configurarFechamentoModal() {

    const modalCheckout =
        document.getElementById(
            "modalCheckout"
        );


    if (!modalCheckout) return;


    /* Fechar clicando fora do conteúdo */

    modalCheckout.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                modalCheckout
            ) {

                fecharCheckout();

            }

        }
    );

}



/* =========================================================
   TECLA ESC
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            fecharCarrinho();

            fecharCheckout();

        }

    }
);



/* =========================================================
   SEGURANÇA BÁSICA PARA TEXTO INSERIDO NO HTML
========================================================= */

function escaparHTML(texto) {

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}



/* =========================================================
   CONFIGURAR FORMULÁRIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        configurarFormularioPedido();

    }
);