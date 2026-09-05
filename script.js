let agendamento = { servico: '', valor: 0, tempo: '', data: '', profissional: '', hora: '' };

// Dados Iniciais Padrão (Caso o LocalStorage esteja vazio)
const DEFAULT_BARBEIROS = [
    { nome: 'Manoel', foto: 'manoel.png' },
    { nome: 'Rodrigo', foto: 'rodrigo.png' },
    { nome: 'Gabriel', foto: 'gabriel.png' }
];

const DEFAULT_SERVICOS = [
    { id: 's1', categoria: 'destaques', nome: 'Combo Corte + Barba', preco: 60, tempo: '60min' },
    { id: 's2', categoria: 'destaques', nome: 'Corte Clássico', preco: 40, tempo: '30min' },
    { id: 's3', categoria: 'destaques', nome: 'Barba', preco: 25, tempo: '30min' },
    { id: 's4', categoria: 'combos', nome: 'Combo Taninoplastia + Corte + Barba', preco: 150, tempo: '160min' },
    { id: 's5', categoria: 'combos', nome: 'Selagem + Corte + Barba', preco: 130, tempo: '140min' },
    { id: 's6', categoria: 'combos', nome: 'Pigmentação + Corte', preco: 55, tempo: '60min' },
    { id: 's7', categoria: 'estetica', nome: 'Sobrancelha (Pinça)', preco: 15, tempo: '10min' },
    { id: 's8', categoria: 'estetica', nome: 'Depilação Nariz', preco: 10, tempo: '20min' }
];

// Inicializar LocalStorage se necessário
if (!localStorage.getItem('dombigode_barbeiros')) {
    localStorage.setItem('dombigode_barbeiros', JSON.stringify(DEFAULT_BARBEIROS));
}
if (!localStorage.getItem('dombigode_servicos')) {
    localStorage.setItem('dombigode_servicos', JSON.stringify(DEFAULT_SERVICOS));
}

// Carregar serviços na tela ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    renderizarServicosCliente();
});

// --- NAVEGAÇÃO PRINCIPAL (CLIENTE) ---
document.getElementById('tabAgendar').addEventListener('click', () => {
    document.getElementById('tabAgendar').classList.add('active');
    document.getElementById('tabHistorico').classList.remove('active');
    document.getElementById('viewAgendar').style.display = 'block';
    document.getElementById('viewHistorico').style.display = 'none';
    document.getElementById('viewAdminDashboard').style.display = 'none';
});

document.getElementById('tabHistorico').addEventListener('click', () => {
    document.getElementById('tabHistorico').classList.add('active');
    document.getElementById('tabAgendar').classList.remove('active');
    document.getElementById('viewHistorico').style.display = 'block';
    document.getElementById('viewAgendar').style.display = 'none';
    document.getElementById('viewAdminDashboard').style.display = 'none';
    verificarLoginHistorico();
});

// Sincronizar scroll com categorias (Menu Sticky)
const catLinks = document.querySelectorAll('.cat-link');
const sections = document.querySelectorAll('.category-section');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 180) current = section.getAttribute('id');
    });
    catLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') && link.getAttribute('href').includes(current)) {
            link.classList.add('active');
            link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    });
});

// Renderizar serviços dinamicamente na aba do cliente
function renderizarServicosCliente() {
    const container = document.getElementById('dynamicServicesContainer');
    const servicos = JSON.parse(localStorage.getItem('dombigode_servicos')) || DEFAULT_SERVICOS;

    const cats = [
        { id: 'destaques', titulo: 'Mais Pedidos <i class="fa-solid fa-fire" style="color: #ff5722; font-size: 1.2rem;"></i>' },
        { id: 'combos', titulo: 'Combos Premium' },
        { id: 'cabelo', titulo: 'Cabelo' },
        { id: 'estetica', titulo: 'Estética & Cuidados' }
    ];

    container.innerHTML = '';
    cats.forEach(c => {
        let servsCat = servicos.filter(s => s.categoria === c.id);
        if(servsCat.length === 0) return;

        let section = document.createElement('section');
        section.id = c.id;
        section.className = 'category-section';
        section.innerHTML = `<h2>${c.titulo}</h2>`;

        servsCat.forEach(s => {
            let card = document.createElement('div');
            card.className = s.categoria === 'combos' ? 'service-card combo' : 'service-card';
            card.onclick = () => iniciarAgendamento(s.nome, s.preco, s.tempo);
            card.innerHTML = `
                <div class="service-info">
                    <h3>${s.nome}</h3>
                    <p>Qualidade garantida Dom Bigode</p>
                </div>
                <div class="service-price">
                    <span>R$ ${s.preco},00</span>
                    <small>${s.tempo}</small>
                </div>
            `;
            section.appendChild(card);
        });
        container.appendChild(section);
    });
}

// --- FLUXO DE AGENDAMENTO ---
function iniciarAgendamento(nomeServico, valor, tempo) {
    agendamento.servico = nomeServico; agendamento.valor = valor; agendamento.tempo = tempo;
    document.getElementById('modalServiceName').innerText = nomeServico;
    document.getElementById('bookingModal').style.display = 'block';
    
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    document.getElementById('step4').style.display = 'none';
    gerarDias();
    gerarBarbeirosModal();
}

function fecharModal() { document.getElementById('bookingModal').style.display = 'none'; }

function gerarDias() {
    const datesGrid = document.getElementById('datesGrid'); datesGrid.innerHTML = '';
    const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    for (let i = 0; i < 7; i++) {
        let data = new Date(); data.setDate(data.getDate() + i);
        let diaNum = data.getDate();
        let diaTexto = i === 0 ? 'Hoje' : diasDaSemana[data.getDay()];
        let dataFormatada = `${diaNum.toString().padStart(2, '0')}/${(data.getMonth()+1).toString().padStart(2, '0')}`;
        
        let btn = document.createElement('div'); btn.className = 'date-btn';
        btn.innerHTML = `${diaNum} <span>${diaTexto}</span>`;
        btn.onclick = () => selecionarData(dataFormatada, btn);
        datesGrid.appendChild(btn);
    }
}

function selecionarData(dataStr, elementoElement) {
    document.querySelectorAll('.date-btn').forEach(btn => btn.classList.remove('active'));
    elementoElement.classList.add('active'); agendamento.data = dataStr;
    setTimeout(() => {
        document.getElementById('step2').style.display = 'block';
        document.getElementById('step2').scrollIntoView({ behavior: 'smooth' });
    }, 200);
}

function gerarBarbeirosModal() {
    const grid = document.getElementById('professionalsGridModal');
    grid.innerHTML = '';
    const barbeiros = JSON.parse(localStorage.getItem('dombigode_barbeiros')) || DEFAULT_BARBEIROS;

    barbeiros.forEach(b => {
        let card = document.createElement('div');
        card.className = 'prof-card';
        card.onclick = () => selecionarProfissional(b.nome);
        card.innerHTML = `
            <img src="${b.foto}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(b.nome)}&background=D4A35B&color=fff'" alt="${b.nome}">
            <span>${b.nome}</span>
        `;
        grid.appendChild(card);
    });
}

function selecionarProfissional(nome) {
    agendamento.profissional = nome;
    document.querySelectorAll('.prof-card').forEach(card => {
        card.classList.remove('selected');
        if(card.querySelector('span').innerText === nome) {
            card.classList.add('selected');
        }
    });

    setTimeout(() => {
        document.getElementById('step3').style.display = 'block';
        document.getElementById('step3').scrollIntoView({ behavior: 'smooth' });
        gerarHorarios();
    }, 200); 
}

function gerarHorarios() {
    const timesGrid = document.getElementById('timesGrid'); timesGrid.innerHTML = '';
    const horarios = ['09:00', '10:30', '14:00', '15:30', '17:00'];
    horarios.forEach(hora => {
        let btn = document.createElement('div'); btn.className = 'time-btn';
        btn.innerText = hora; btn.onclick = () => selecionarHora(hora, btn);
        timesGrid.appendChild(btn);
    });
}

function selecionarHora(hora, elementoElement) {
    document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
    elementoElement.classList.add('active'); agendamento.hora = hora;
    preencherResumo();
}

function preencherResumo() {
    document.getElementById('resumoServico').innerText = agendamento.servico;
    document.getElementById('resumoProfissional').innerText = agendamento.profissional;
    document.getElementById('resumoData').innerText = agendamento.data;
    document.getElementById('resumoHora').innerText = agendamento.hora;
    document.getElementById('resumoValor').innerText = `R$ ${agendamento.valor},00`;
    
    const wppSalvo = localStorage.getItem('dombigode_wpp');
    const nomeSalvo = localStorage.getItem('dombigode_nome');
    
    if(wppSalvo && nomeSalvo) {
        document.getElementById('formNovoCliente').style.display = 'none';
        document.getElementById('avisoLogado').style.display = 'block';
        document.getElementById('nomeClienteLogado').innerText = nomeSalvo;
    } else {
        document.getElementById('formNovoCliente').style.display = 'block';
        document.getElementById('avisoLogado').style.display = 'none';
    }
    
    document.getElementById('step4').style.display = 'block';
    document.getElementById('step4').scrollIntoView({ behavior: 'smooth' });
}

function finalizarAgendamento() {
    let nome = localStorage.getItem('dombigode_nome');
    let tel = localStorage.getItem('dombigode_wpp');
    
    if(!nome || !tel) {
        nome = document.getElementById('nomeCliente').value;
        tel = document.getElementById('telefoneCliente').value;
        if(!nome || !tel) return alert("Por favor, preencha nome e WhatsApp.");
        
        localStorage.setItem('dombigode_nome', nome);
        localStorage.setItem('dombigode_wpp', tel);
    }

    let novoAgendamento = {
        id: 'ag_' + Date.now(),
        cliente: nome,
        telefone: tel,
        servico: agendamento.servico,
        valor: agendamento.valor,
        profissional: agendamento.profissional,
        data: agendamento.data,
        hora: agendamento.hora,
        timestamp: Date.now(),
        status: 'concluido' // 'concluido' ou 'cancelado'
    };

    let agendamentosSalvos = JSON.parse(localStorage.getItem('dombigode_todos_agendamentos')) || [];
    agendamentosSalvos.push(novoAgendamento);
    localStorage.setItem('dombigode_todos_agendamentos', JSON.stringify(agendamentosSalvos));
    
    alert(`Sucesso! Seu horário para ${agendamento.servico} no dia ${agendamento.data} às ${agendamento.hora} foi marcado!`);
    fecharModal();
    document.getElementById('tabHistorico').click();
}

// --- LOGIN DO CLIENTE (HISTÓRICO) ---
function verificarLoginHistorico() {
    const wppSalvo = localStorage.getItem('dombigode_wpp');
    if (wppSalvo) {
        document.getElementById('areaLogin').style.display = 'none';
        document.getElementById('areaMeusAgendamentos').style.display = 'block';
        document.getElementById('boasVindasNome').innerText = `Olá, ${localStorage.getItem('dombigode_nome')}!`;
        carregarHistoricoCliente();
    } else {
        document.getElementById('areaLogin').style.display = 'block';
        document.getElementById('areaMeusAgendamentos').style.display = 'none';
    }
}

function fazerLogin() {
    const wpp = document.getElementById('loginWpp').value;
    const nome = document.getElementById('loginNome').value;
    if(!wpp) return alert("Digite seu WhatsApp!");

    if(!localStorage.getItem('dombigode_wpp') && !nome) {
        document.getElementById('areaCadastroNovo').style.display = 'block';
        if(!nome) return;
    }
    localStorage.setItem('dombigode_wpp', wpp);
    if(nome) localStorage.setItem('dombigode_nome', nome);
    verificarLoginHistorico();
}

function sairConta() {
    localStorage.removeItem('dombigode_wpp');
    localStorage.removeItem('dombigode_nome');
    verificarLoginHistorico();
}

function carregarHistoricoCliente() {
    const wppLogado = localStorage.getItem('dombigode_wpp');
    let agendamentosSalvos = JSON.parse(localStorage.getItem('dombigode_todos_agendamentos')) || [];
    const meusAgendamentos = agendamentosSalvos.filter(item => item.telefone === wppLogado);
    
    const listaHistorico = document.getElementById('listaHistorico');
    if(meusAgendamentos.length === 0) {
        listaHistorico.innerHTML = `<p style="text-align: center; color: #888; margin-top: 2rem;">Você ainda não tem agendamentos recentes.</p>`;
        return;
    }

    listaHistorico.innerHTML = '';
    meusAgendamentos.forEach(item => {
        let card = document.createElement('div');
        card.className = 'summary-card';
        card.style.marginTop = '1rem';
        let statusBadge = item.status === 'concluido' ? '<span style="color:var(--gold)">Confirmado</span>' : '<span style="color:#ff4c4c">Cancelado</span>';
        card.innerHTML = `
            <p><strong>Status:</strong> ${statusBadge}</p>
            <p style="font-weight: bold;">${item.servico}</p>
            <p>${item.data} às ${item.hora} - Com ${item.profissional}</p>
        `;
        listaHistorico.appendChild(card);
    });
}

// --- PAINEL ADMINISTRATIVO (PAINELADM) ---
function abrirLoginAdmin() {
    if(localStorage.getItem('dombigode_admin_logado') === 'true') {
        mostrarDashboardAdmin();
    } else {
        document.getElementById('adminLoginModal').style.display = 'block';
    }
}

function fecharLoginAdmin() { document.getElementById('adminLoginModal').style.display = 'none'; }

function tentarLogarAdmin() {
    const usuarioDigitado = document.getElementById('usuarioAdmin').value;
    const senhaDigitada = document.getElementById('senhaAdmin').value;

    // ATENÇÃO:
// Esta validação de credenciais no front-end é apenas um MOCK (simulação) para validação do MVP.
// Na versão de produção, a autenticação será transferida para o back-end (Node.js) com senhas criptografadas e JWT.
    if (usuarioDigitado === 'PainelADM' && senhaDigitada === 'dombigode123') {
        localStorage.setItem('dombigode_admin_logado', 'true');
        fecharLoginAdmin();
        document.getElementById('usuarioAdmin').value = '';
        document.getElementById('senhaAdmin').value = '';
        mostrarDashboardAdmin();
    } else {
        alert('Usuário ou senha incorretos!');
    }
}

function sairAdmin() {
    localStorage.removeItem('dombigode_admin_logado');
    document.getElementById('viewAdminDashboard').style.display = 'none';
    document.getElementById('viewAgendar').style.display = 'block';
    document.getElementById('clientTabsNav').style.display = 'flex';
}

function mostrarDashboardAdmin() {
    document.getElementById('viewAgendar').style.display = 'none';
    document.getElementById('viewHistorico').style.display = 'none';
    document.getElementById('clientTabsNav').style.display = 'none';
    document.getElementById('viewAdminDashboard').style.display = 'block';
    carregarDashboardFinanceiro();
    carregarEquipeAdmin();
    carregarServicosAdmin();
    carregarProdutosAdmin();
}

// Trocar Sub-abas do Painel Admin
function trocarAbaAdmin(aba) {
    document.getElementById('adminSecFinanceiro').style.display = aba === 'financeiro' ? 'block' : 'none';
    document.getElementById('adminSecEquipe').style.display = aba === 'equipe' ? 'block' : 'none';
    document.getElementById('adminSecServicos').style.display = aba === 'servicos' ? 'block' : 'none';
    document.getElementById('adminSecProdutos').style.display = aba === 'produtos' ? 'block' : 'none';

    document.getElementById('subTabFinanceiro').className = aba === 'financeiro' ? 'admin-sub-btn active' : 'admin-sub-btn';
    document.getElementById('subTabEquipe').className = aba === 'equipe' ? 'admin-sub-btn active' : 'admin-sub-btn';
    document.getElementById('subTabServicos').className = aba === 'servicos' ? 'admin-sub-btn active' : 'admin-sub-btn';
    document.getElementById('subTabProdutos').className = aba === 'produtos' ? 'admin-sub-btn active' : 'admin-sub-btn';
}

// 1. GESTÃO FINANCEIRA E RELATÓRIOS
function carregarDashboardFinanceiro() {
    let agendamentos = JSON.parse(localStorage.getItem('dombigode_todos_agendamentos')) || [];
    let concluidos = agendamentos.filter(a => a.status === 'concluido');

    let agora = Date.now();
    let umDia = 24 * 60 * 60 * 1000;

    let somaHoje = 0, soma7Dias = 0, soma30Dias = 0, somaAno = 0;

    // Data de hoje formatada (DD/MM) para conferência rápida
    let hojeStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    // Se a data do agendamento bater com a string de hoje ou estiver nas últimas 24h
    concluidos.forEach(a => {
        let diffTime = agora - a.timestamp;
        if(a.data === hojeStr || diffTime <= umDia) somaHoje += a.valor;
        if(diffTime <= 7 * umDia) soma7Dias += a.valor;
        if(diffTime <= 30 * umDia) soma30Dias += a.valor;
        if(diffTime <= 365 * umDia) somaAno += a.valor;
    });

    document.getElementById('fatHoje').innerText = `R$ ${somaHoje},00`;
    document.getElementById('fat7Dias').innerText = `R$ ${soma7Dias},00`;
    document.getElementById('fat30Dias').innerText = `R$ ${soma30Dias},00`;
    document.getElementById('fatAno').innerText = `R$ ${somaAno},00`;

    // Seletor de Barbeiros
    let selector = document.getElementById('adminBarberSelector');
    selector.innerHTML = '';
    let barbeiros = JSON.parse(localStorage.getItem('dombigode_barbeiros')) || DEFAULT_BARBEIROS;

    barbeiros.forEach((b, idx) => {
        let pill = document.createElement('div');
        pill.className = idx === 0 ? 'admin-barber-pill active' : 'admin-barber-pill';
        pill.onclick = () => selecionarBarbeiroFinanceiro(b.nome, pill);
        pill.innerHTML = `
            <img src="${b.foto}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(b.nome)}&background=D4A35B&color=fff'">
            <span style="font-weight:600; font-size:0.9rem;">${b.nome}</span>
        `;
        selector.appendChild(pill);
    });

    if(barbeiros.length > 0) {
        selecionarBarbeiroFinanceiro(barbeiros[0].nome, selector.children[0]);
    }
}

let barbeiroSelecionadoAtual = '';
function selecionarBarbeiroFinanceiro(nomeBarbeiro, element) {
    barbeiroSelecionadoAtual = nomeBarbeiro;
    document.querySelectorAll('.admin-barber-pill').forEach(p => p.classList.remove('active'));
    element.classList.add('active');

    document.getElementById('barberDetailContainer').style.display = 'block';
    document.getElementById('detalheBarberNome').innerText = nomeBarbeiro;

    let agendamentos = JSON.parse(localStorage.getItem('dombigode_todos_agendamentos')) || [];
    let concluidosBarber = agendamentos.filter(a => a.profissional === nomeBarbeiro && a.status === 'concluido');
    let canceladosBarber = agendamentos.filter(a => a.profissional === nomeBarbeiro && a.status === 'cancelado');

    let totalBarber = concluidosBarber.reduce((acc, item) => acc + item.valor, 0);
    document.getElementById('detalheBarberTotal').innerText = `Total Concluído: R$ ${totalBarber},00`;

    // Renderizar lista de concluídos
    let containerConcluidos = document.getElementById('listaConcluidosBarber');
    if(concluidosBarber.length === 0) {
        containerConcluidos.innerHTML = `<p style="color: #888; font-size: 0.9rem;">Nenhum serviço concluído registrado.</p>`;
    } else {
        containerConcluidos.innerHTML = '';
        concluidosBarber.forEach((item, index) => {
            let row = document.createElement('div');
            row.className = 'admin-card-item';
            row.innerHTML = `
                <div>
                    <p style="font-weight: bold;">${item.servico}</p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">Cliente: ${item.cliente} (${item.telefone}) | ${item.data} às ${item.hora}</p>
                </div>
                <div style="text-align: right;">
                    <span style="color: var(--gold); font-weight: bold;">R$ ${item.valor},00</span>
                    <button onclick="mudarStatusAgendamento('${item.id}', 'cancelado')" style="display:block; background:transparent; color:#ff4c4c; border:none; font-size:0.75rem; cursor:pointer; margin-top:5px;">Marcar Cancelado</button>
                </div>
            `;
            containerConcluidos.appendChild(row);
        });
    }

    // Renderizar cancelados
    let containerCancelados = document.getElementById('listaCanceladosBarber');
    if(canceladosBarber.length === 0) {
        containerCancelados.innerHTML = `<p style="color: #888; font-size: 0.9rem;">Nenhum cancelamento registrado.</p>`;
    } else {
        containerCancelados.innerHTML = '';
        canceladosBarber.forEach(item => {
            let row = document.createElement('div');
            row.className = 'admin-card-item';
            row.style.borderColor = 'rgba(255,76,76,0.3)';
            row.innerHTML = `
                <div>
                    <p style="font-weight: bold; text-decoration: line-through; color: #888;">${item.servico}</p>
                    <p style="font-size: 0.85rem; color: #888;">Cliente: ${item.cliente} (${item.telefone}) | ${item.data} às ${item.hora}</p>
                </div>
                <div style="text-align: right;">
                    <span style="color: #ff4c4c;">R$ ${item.valor},00 (Cancelado)</span>
                    <button onclick="mudarStatusAgendamento('${item.id}', 'concluido')" style="display:block; background:transparent; color:var(--gold); border:none; font-size:0.75rem; cursor:pointer; margin-top:5px;">Restaurar</button>
                </div>
            `;
            containerCancelados.appendChild(row);
        });
    }
}

function toggleCancelados() {
    let content = document.getElementById('listaCanceladosBarber');
    let arrow = document.getElementById('arrowCancel');
    if(content.style.display === 'none') {
        content.style.display = 'block';
        arrow.className = 'fa-solid fa-chevron-up';
    } else {
        content.style.display = 'none';
        arrow.className = 'fa-solid fa-chevron-down';
    }
}

function mudarStatusAgendamento(id, novoStatus) {
    let agendamentos = JSON.parse(localStorage.getItem('dombigode_todos_agendamentos')) || [];
    let ag = agendamentos.find(a => a.id === id);
    if(ag) {
        ag.status = novoStatus;
        localStorage.setItem('dombigode_todos_agendamentos', JSON.stringify(agendamentos));
        carregarDashboardFinanceiro();
        if(barbeiroSelecionadoAtual) {
            // Reabre o selecionado atual
            let selector = document.getElementById('adminBarberSelector');
            // Busca o pill correspondente e clica
            Array.from(selector.children).forEach(pill => {
                if(pill.innerText.includes(barbeiroSelecionadoAtual)) selecionarBarbeiroFinanceiro(barbeiroSelecionadoAtual, pill);
            });
        }
    }
}

// 2. GESTÃO DE EQUIPE (BARBEIROS)
function carregarEquipeAdmin() {
    let container = document.getElementById('listaEquipeAdmin');
    let barbeiros = JSON.parse(localStorage.getItem('dombigode_barbeiros')) || DEFAULT_BARBEIROS;

    if(barbeiros.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #888;">Nenhum barbeiro cadastrado.</p>`;
        return;
    }

    container.innerHTML = '';
    barbeiros.forEach((b, index) => {
        let card = document.createElement('div');
        card.className = 'admin-card-item';
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${b.foto}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(b.nome)}&background=D4A35B&color=fff'" style="width:45px; height:45px; border-radius:50%; object-fit:cover;">
                <div>
                    <h5 style="color: var(--text-primary);">${b.nome}</h5>
                    <p style="font-size: 0.75rem; color: var(--text-secondary);">Membro ativo na agenda</p>
                </div>
            </div>
            <div>
                <button onclick="abrirModalBarbeiro(${index})" style="background:transparent; color:var(--gold); border:1px solid var(--gold); padding:5px 10px; border-radius:4px; cursor:pointer; margin-right:5px; font-size:0.8rem;">Editar</button>
                <button onclick="excluirBarbeiro(${index})" style="background:transparent; color:#ff4c4c; border:1px solid #ff4c4c; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">Remover</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function abrirModalBarbeiro(index = -1) {
    document.getElementById('modalBarbeiro').style.display = 'block';
    document.getElementById('barbeiroEditIndex').value = index;
    if(index >= 0) {
        let barbeiros = JSON.parse(localStorage.getItem('dombigode_barbeiros')) || DEFAULT_BARBEIROS;
        document.getElementById('tituloModalBarbeiro').innerText = 'Editar Barbeiro';
        document.getElementById('inputNomeBarbeiro').value = barbeiros[index].nome;
        document.getElementById('inputFotoBarbeiro').value = barbeiros[index].foto;
    } else {
        document.getElementById('tituloModalBarbeiro').innerText = 'Novo Barbeiro';
        document.getElementById('inputNomeBarbeiro').value = '';
        document.getElementById('inputFotoBarbeiro').value = '';
    }
}

function fecharModalBarbeiro() { document.getElementById('modalBarbeiro').style.display = 'none'; }

function salvarBarbeiro() {
    let index = parseInt(document.getElementById('barbeiroEditIndex').value);
    let nome = document.getElementById('inputNomeBarbeiro').value.trim();
    let foto = document.getElementById('inputFotoBarbeiro').value.trim();

    if(!nome) return alert("Digite o nome do barbeiro!");

    let barbeiros = JSON.parse(localStorage.getItem('dombigode_barbeiros')) || DEFAULT_BARBEIROS;
    if(index >= 0) {
        barbeiros[index].nome = nome;
        if(foto) barbeiros[index].foto = foto;
    } else {
        barbeiros.push({ nome: nome, foto: foto || '' });
    }

    localStorage.setItem('dombigode_barbeiros', JSON.stringify(barbeiros));
    fecharModalBarbeiro();
    carregarEquipeAdmin();
    carregarDashboardFinanceiro();
}

function excluirBarbeiro(index) {
    let barbeiros = JSON.parse(localStorage.getItem('dombigode_barbeiros')) || DEFAULT_BARBEIROS;
    let nomeRemovido = barbeiros[index].nome;
    if(confirm(`Deseja remover ${nomeRemovido} da equipe? (O histórico de faturamento anterior continuará salvo nos relatórios).`)) {
        barbeiros.splice(index, 1);
        localStorage.setItem('dombigode_barbeiros', JSON.stringify(barbeiros));
        carregarEquipeAdmin();
        carregarDashboardFinanceiro();
    }
}

// 3. GESTÃO DE SERVIÇOS
function carregarServicosAdmin() {
    let container = document.getElementById('listaServicosAdmin');
    let servicos = JSON.parse(localStorage.getItem('dombigode_servicos')) || DEFAULT_SERVICOS;

    container.innerHTML = '';
    servicos.forEach(s => {
        let card = document.createElement('div');
        card.className = 'admin-card-item';
        card.innerHTML = `
            <div>
                <h5 style="color: var(--text-primary);">${s.nome} <span style="font-size:0.75rem; color:var(--gold); background:rgba(230,179,92,0.1); padding:2px 6px; border-radius:4px;">${s.categoria}</span></h5>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">R$ ${s.preco},00 | Duração: ${s.tempo}</p>
            </div>
            <div>
                <button onclick="abrirModalServico('${s.id}')" style="background:transparent; color:var(--gold); border:1px solid var(--gold); padding:5px 10px; border-radius:4px; cursor:pointer; margin-right:5px; font-size:0.8rem;">Editar</button>
                <button onclick="excluirServico('${s.id}')" style="background:transparent; color:#ff4c4c; border:1px solid #ff4c4c; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function abrirModalServico(id = '') {
    document.getElementById('modalServico').style.display = 'block';
    document.getElementById('servicoEditId').value = id;
    if(id) {
        let servicos = JSON.parse(localStorage.getItem('dombigode_servicos')) || DEFAULT_SERVICOS;
        let s = servicos.find(item => item.id === id);
        if(s) {
            document.getElementById('tituloModalServico').innerText = 'Editar Serviço';
            document.getElementById('selectCatServico').value = s.categoria;
            document.getElementById('inputNomeServico').value = s.nome;
            document.getElementById('inputPrecoServico').value = s.preco;
            document.getElementById('inputTempoServico').value = s.tempo;
        }
    } else {
        document.getElementById('tituloModalServico').innerText = 'Novo Serviço';
        document.getElementById('selectCatServico').value = 'destaques';
        document.getElementById('inputNomeServico').value = '';
        document.getElementById('inputPrecoServico').value = '';
        document.getElementById('inputTempoServico').value = '30min';
    }
}

function fecharModalServico() { document.getElementById('modalServico').style.display = 'none'; }

function salvarServico() {
    let id = document.getElementById('servicoEditId').value;
    let categoria = document.getElementById('selectCatServico').value;
    let nome = document.getElementById('inputNomeServico').value.trim();
    let preco = parseFloat(document.getElementById('inputPrecoServico').value);
    let tempo = document.getElementById('inputTempoServico').value.trim();

    if(!nome || isNaN(preco)) return alert("Preencha o nome e o preço corretamente!");

    let servicos = JSON.parse(localStorage.getItem('dombigode_servicos')) || DEFAULT_SERVICOS;
    if(id) {
        let s = servicos.find(item => item.id === id);
        if(s) {
            s.categoria = categoria;
            s.nome = nome;
            s.preco = preco;
            s.tempo = tempo;
        }
    } else {
        servicos.push({ id: 's_' + Date.now(), categoria, nome, preco, tempo });
    }

    localStorage.setItem('dombigode_servicos', JSON.stringify(servicos));
    fecharModalServico();
    carregarServicosAdmin();
    renderizarServicosCliente();
}

function excluirServico(id) {
    if(confirm("Deseja realmente excluir este serviço do catálogo?")) {
        let servicos = JSON.parse(localStorage.getItem('dombigode_servicos')) || DEFAULT_SERVICOS;
        servicos = servicos.filter(item => item.id !== id);
        localStorage.setItem('dombigode_servicos', JSON.stringify(servicos));
        carregarServicosAdmin();
        renderizarServicosCliente();
    }
}

// 4. GESTÃO DE PRODUTOS E BEBIDAS
function carregarProdutosAdmin() {
    let container = document.getElementById('listaProdutosAdmin');
    let produtos = JSON.parse(localStorage.getItem('dombigode_produtos')) || [];

    if(produtos.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #888; margin-top: 2rem;">Nenhum produto cadastrado no balcão.</p>`;
        return;
    }

    container.innerHTML = '';
    produtos.forEach((p, index) => {
        let card = document.createElement('div');
        card.className = 'admin-card-item';
        card.innerHTML = `
            <div>
                <h5 style="color: var(--text-primary);">${p.nome}</h5>
                <p style="font-size: 0.85rem; color: var(--gold);">R$ ${p.preco},00</p>
            </div>
            <div>
                <button onclick="excluirProduto(${index})" style="background:transparent; color:#ff4c4c; border:1px solid #ff4c4c; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem;">Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function abrirModalProduto() { document.getElementById('modalProduto').style.display = 'block'; }
function fecharModalProduto() { document.getElementById('modalProduto').style.display = 'none'; }

function salvarProduto() {
    let nome = document.getElementById('inputNomeProduto').value.trim();
    let preco = parseFloat(document.getElementById('inputPrecoProduto').value);

    if(!nome || isNaN(preco)) return alert("Preencha o nome e o preço do produto!");

    let produtos = JSON.parse(localStorage.getItem('dombigode_produtos')) || [];
    produtos.push({ nome, preco });
    localStorage.setItem('dombigode_produtos', JSON.stringify(produtos));

    fecharModalProduto();
    document.getElementById('inputNomeProduto').value = '';
    document.getElementById('inputPrecoProduto').value = '';
    carregarProdutosAdmin();
}

function excluirProduto(index) {
    let produtos = JSON.parse(localStorage.getItem('dombigode_produtos')) || [];
    produtos.splice(index, 1);
    localStorage.setItem('dombigode_produtos', JSON.stringify(produtos));
    carregarProdutosAdmin();
}