const SALAS = {
  araucaria: { nome: 'Araucária', tipo: 'Escritório privativo', area: '84 m²', valor: '4.320,00', estacao: false },
  imbuia: { nome: 'Imbuia', tipo: 'Escritório privativo', area: '46 m²', valor: '2.300,00', estacao: false },
  cedro: { nome: 'Cedro', tipo: 'Auditório', area: '38 m²', valor: '4.429,21', estacao: false },
  jacaranda: { nome: 'Jacarandá', tipo: 'Sala coworking', area: '25 m²', valor: '2.913,96', estacao: false },
  tipuana: { nome: 'Tipuana', tipo: 'Sala com mesa de reunião', area: '24,95 m²', valor: '2.908,13', estacao: false },
  'pau-brasil': { nome: 'Pau-Brasil', tipo: 'Sala para 4 lugares', area: '20 m²', valor: '1.800,00', estacao: false },
  pitanga: { nome: 'Pitanga', tipo: 'Sala privativa', area: '13 m²', valor: '1.031,29', estacao: false },
  camelia: { nome: 'Camélia', tipo: 'Sala para 6 lugares', area: '11,75 m²', valor: '1.369,56', estacao: false },
  ipe: { nome: 'Ipê', tipo: 'Sala privativa para 1 pessoa', area: '5,69 m²', valor: '700,00', estacao: false },
  magnolia: { nome: 'Magnólia', tipo: 'Estação privativa', area: 'Individual', valor: '500,00', estacao: true }
};

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

function formatDateBR(iso) {
  if (!iso) return '___/___/______';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function formatDateLong(iso) {
  const date = iso ? new Date(`${iso}T12:00:00`) : new Date();
  return `${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

function maskPhone(value) {
  let v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 6) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  if (v.length > 2) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length > 0) return `(${v}`;
  return v;
}

function parseBRL(str) {
  if (!str) return 0;
  return Number(String(str).replace(/\./g, '').replace(',', '.')) || 0;
}

function formatBRL(num) {
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getSelectedItens(form) {
  const itens = [];

  form.querySelectorAll('input[name="salas"]:checked').forEach((input) => {
    const sala = SALAS[input.value];
    if (!sala) return;
    const unit = parseBRL(sala.valor);
    itens.push({
      key: input.value,
      nome: sala.nome,
      tipo: sala.tipo,
      area: sala.area,
      qtd: 1,
      valorUnitario: sala.valor,
      subtotal: unit,
      subtotalTexto: formatBRL(unit)
    });
  });

  const qtdMagnolia = Math.max(0, parseInt(form.qtdMagnolia.value, 10) || 0);
  if (qtdMagnolia > 0) {
    const sala = SALAS.magnolia;
    const unit = parseBRL(sala.valor);
    const subtotal = unit * qtdMagnolia;
    itens.push({
      key: 'magnolia',
      nome: sala.nome,
      tipo: sala.tipo,
      area: sala.area,
      qtd: qtdMagnolia,
      valorUnitario: sala.valor,
      subtotal,
      subtotalTexto: formatBRL(subtotal)
    });
  }

  return itens;
}

function getFormData(form) {
  const itens = getSelectedItens(form);
  const prazoIndeterminado = form.tipoPrazo.value === 'indeterminado';
  const totalCalculado = itens.reduce((sum, item) => sum + item.subtotal, 0);
  const valorMensal = form.valorMensal.value.trim() || formatBRL(totalCalculado);

  return {
    tipoPessoa: form.tipoPessoa.value,
    razaoSocial: form.razaoSocial.value.trim(),
    documento: form.documento.value.trim(),
    rgIe: form.rgIe.value.trim() || '—',
    endereco: form.endereco.value.trim(),
    email: form.emailContrato.value.trim(),
    telefone: form.telefoneContrato.value.trim(),
    representante: form.representante.value.trim() || '—',
    repCpf: form.repCpf.value.trim() || '—',
    repCargo: form.repCargo.value.trim() || '—',
    itens,
    espacosTitulo: itens.map((i) => (i.qtd > 1 ? `${i.nome} (${i.qtd})` : i.nome)).join(', '),
    valorMensal,
    diaVencimento: form.diaVencimento.value,
    dataInicio: formatDateBR(form.dataInicio.value),
    prazoTexto: prazoIndeterminado
      ? 'Prazo indeterminado, renovável automaticamente'
      : `Prazo determinado até ${formatDateBR(form.dataFim.value)}`,
    observacoes: form.observacoes.value.trim() || 'Nenhuma',
    dataAssinatura: formatDateLong(null)
  };
}

function buildItensTable(itens) {
  const rows = itens.map((item) => `
    <tr>
      <td><strong>${item.nome}</strong></td>
      <td>${item.tipo}</td>
      <td>${item.area}</td>
      <td>${item.qtd}</td>
      <td>R$ ${item.valorUnitario}</td>
      <td>R$ ${item.subtotalTexto}</td>
    </tr>`).join('');

  return `<table>
    <thead>
      <tr>
        <th>Espaço</th>
        <th>Tipo</th>
        <th>Área</th>
        <th>Qtd</th>
        <th>Valor unit.</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function buildContractHTML(d) {
  const repBlock = d.tipoPessoa === 'pj'
    ? `<p><strong>Representante legal:</strong> ${d.representante}<br>
       CPF: ${d.repCpf} · Cargo: ${d.repCargo}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Contrato — ${d.espacosTitulo} — ${d.razaoSocial}</title>
<style>
  @page { margin: 1.8cm; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; line-height: 1.45; color: #1e1812; max-width: 800px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 16pt; text-align: center; margin: 0 0 4px; }
  h2 { font-size: 12pt; text-align: center; font-weight: normal; margin: 0 0 24px; color: #5c4033; }
  h3 { font-size: 11pt; margin: 20px 0 8px; border-bottom: 1px solid #d4c5b0; padding-bottom: 4px; }
  p, li { margin: 0 0 8px; text-align: justify; }
  ul { margin: 0 0 12px; padding-left: 18px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10.5pt; }
  th, td { border: 1px solid #d4c5b0; padding: 8px; text-align: left; vertical-align: top; }
  th { background: #f7f3ed; }
  .meta { font-size: 9.5pt; color: #7a6e62; text-align: center; margin-bottom: 20px; }
  .assinaturas { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 48px; }
  .assinatura { text-align: center; padding-top: 48px; border-top: 1px solid #1e1812; font-size: 10pt; }
  .no-print { text-align: center; margin: 0 0 24px; }
  .btn { display: inline-block; padding: 10px 22px; margin: 0 6px; background: #5c4033; color: #fff; border: none; border-radius: 999px; cursor: pointer; font-size: 14px; text-decoration: none; }
  @media print { .no-print { display: none !important; } body { padding: 0; } }
</style>
</head>
<body>
  <div class="no-print">
    <button class="btn" onclick="window.print()">Imprimir / Salvar PDF</button>
    <button class="btn" onclick="window.close()" style="background:#7a6e62">Fechar</button>
  </div>

  <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE COWORKING</h1>
  <h2>Casa Folloni — Life Consultoria Imobiliária</h2>
  <p class="meta">Modelo gerado automaticamente pelo site. Recomenda-se revisão jurídica antes da assinatura.</p>

  <p>Pelo presente instrumento particular, as partes abaixo qualificadas celebram o presente <strong>Contrato de Prestação de Serviços de Coworking</strong>, que se regerá pelas cláusulas seguintes e pelo Código Civil Brasileiro.</p>

  <h3>CONTRATADA (Prestadora)</h3>
  <p><strong>Life Consultoria Imobiliária</strong><br>
  CNPJ: 22.044.720/0001-91 · CRECI: J5828<br>
  Endereço: Rua Alberto Folloni, 700, Curitiba/PR<br>
  Representada por: <strong>Raquel Celoni Dombroski</strong> — CPF 034.044.339-12 — CRECI/PR 28.118</p>

  <h3>CONTRATANTE (Cliente)</h3>
  <p><strong>${d.razaoSocial}</strong><br>
  CPF/CNPJ: ${d.documento}<br>
  RG/IE: ${d.rgIe}<br>
  Endereço: ${d.endereco}<br>
  E-mail: ${d.email}<br>
  Telefone/WhatsApp: ${d.telefone}</p>
  ${repBlock}

  <h3>CLÁUSULA 1 — OBJETO</h3>
  <p>1.1. O presente contrato tem por objeto a <strong>prestação de serviços de coworking</strong>, consistente na disponibilização de espaço de trabalho e infraestrutura compartilhada na <strong>Casa Folloni</strong>, situada na Rua Alberto Folloni, 700, Curitiba/PR, mediante contraprestação mensal, <strong>sem caracterizar locação imobiliária</strong> regida pela Lei nº 8.245/1991.</p>
  <p>1.2. Espaços e planos contratados:</p>
  ${buildItensTable(d.itens)}
  <table>
    <tr><th style="width:38%">Valor mensal total</th><td><strong>R$ ${d.valorMensal}</strong></td></tr>
    <tr><th>Vencimento</th><td>Todo dia ${d.diaVencimento} de cada mês</td></tr>
    <tr><th>Início</th><td>${d.dataInicio}</td></tr>
    <tr><th>Prazo</th><td>${d.prazoTexto}</td></tr>
    <tr><th>Sala de reunião</th><td>3 (três) horas mensais inclusas (Sala Oliveira)</td></tr>
    <tr><th>Observações</th><td>${d.observacoes}</td></tr>
  </table>
  <p>1.3. Estão inclusos, conforme disponibilidade: acesso aos espaços contratados, internet, áreas comuns e as horas de reunião previstas. Serviços extras serão cobrados à parte conforme tabela vigente.</p>

  <h3>CLÁUSULA 2 — NATUREZA DO CONTRATO</h3>
  <p>2.1. Trata-se de contrato de prestação de serviços com cessão de uso de espaço e infraestrutura, podendo a CONTRATADA acessar as áreas para limpeza, manutenção, segurança e vistoria.</p>
  <p>2.2. O CONTRATANTE não adquire direito de preferência, renovação compulsória ou prerrogativas típicas de locação comercial.</p>

  <h3>CLÁUSULA 3 — PREÇO E FORMA DE PAGAMENTO</h3>
  <p>3.1. O CONTRATANTE pagará o valor mensal indicado na Cláusula 1.2 até o dia de vencimento.</p>
  <p>3.2. Dados bancários: Banco 077 (Inter) · Agência 0001 · Conta 2005558-7 · Titular Life Consultoria Imobiliária · CNPJ 22.044.720/0001-91.</p>
  <p>3.3. O comprovante deverá ser enviado à CONTRATADA no mesmo dia do pagamento.</p>
  <p>3.4. Reajuste anual pelo IPCA (ou índice substituto), com aviso prévio de 30 dias.</p>

  <h3>CLÁUSULA 4 — ATRASO, MULTA, JUROS E BLOQUEIO DE ACESSO</h3>
  <p>4.1. Em atraso, o valor devido será acrescido de: <strong>multa moratória de 10%</strong>; <strong>juros de 1% ao mês</strong> (pro rata die); e <strong>correção monetária pelo IPCA</strong>.</p>
  <p>4.2. Decorridos <strong>7 (sete) dias corridos</strong> do vencimento sem quitação integral:</p>
  <ul>
    <li>a) a CONTRATADA poderá <strong>bloquear o acesso</strong> do CONTRATANTE e prepostos à Casa Folloni;</li>
    <li>b) poderá <strong>retirar do espaço os bens</strong> do CONTRATANTE, acondicionando-os apenas para retirada mediante agendamento;</li>
    <li>c) a retirada dos bens não exime o pagamento dos valores em aberto.</li>
  </ul>
  <p>4.3. Durante a inadimplência, continua devido o valor mensal com os acréscimos da cláusula 4.1.</p>
  <p>4.4. O acesso será restabelecido após confirmação do pagamento.</p>
  <p>4.5. Bens deverão ser retirados em até 15 dias após notificação do bloqueio; após esse prazo, a CONTRATADA poderá dar destinação adequada, comunicando o CONTRATANTE.</p>

  <h3>CLÁUSULA 5 — OBRIGAÇÕES DO CONTRATANTE</h3>
  <p>5.1. Usar o espaço para atividades lícitas e profissionais compatíveis com a Casa Folloni.</p>
  <p>5.2. Zelar pela conservação e responder por danos causados por si, colaboradores ou visitantes.</p>
  <p>5.3. Cumprir o regulamento interno, quando houver.</p>
  <p>5.4. Não ceder ou sublocar o espaço sem autorização escrita.</p>
  <p>5.5. Manter dados cadastrais atualizados.</p>

  <h3>CLÁUSULA 6 — OBRIGAÇÕES DA CONTRATADA</h3>
  <p>6.1. Disponibilizar o espaço e a infraestrutura do plano em condições de uso.</p>
  <p>6.2. Manter internet e serviços essenciais, ressalvadas interrupções fora de seu controle.</p>
  <p>6.3. Comunicar manutenções que afetem o uso, com antecedência razoável.</p>

  <h3>CLÁUSULA 7 — PRAZO E RESCISÃO</h3>
  <p>7.1. O contrato vigorará conforme a Cláusula 1.2, renovando-se automaticamente se indeterminado, salvo denúncia.</p>
  <p>7.2. Qualquer parte poderá rescindir com aviso prévio de 30 dias por escrito.</p>
  <p>7.3. Rescisão imediata por justa causa nas hipóteses de inadimplência superior a 7 dias, uso ilícito, danos graves ou violação reiterada das regras.</p>
  <p>7.4. Em rescisão por inadimplência, permanecem devidos valores e encargos da Cláusula 4.</p>
  <p>7.5. Ao término, o CONTRATANTE devolverá o espaço limpo, desocupado e com acessos.</p>

  <h3>CLÁUSULA 8 — RESPONSABILIDADE</h3>
  <p>8.1. A CONTRATADA não responde pelas atividades empresariais, fiscais, trabalhistas ou profissionais do CONTRATANTE.</p>
  <p>8.2. O CONTRATANTE é responsável por equipamentos, documentos e valores deixados no espaço.</p>
  <p>8.3. Poderá haver câmeras nas áreas comuns para segurança.</p>

  <h3>CLÁUSULA 9 — SALA DE REUNIÃO E EXTRAS</h3>
  <p>9.1. As 3 horas mensais da Sala Oliveira não são cumulativas, salvo acordo escrito.</p>
  <p>9.2. Horas extras e pacotes seguem a tabela vigente.</p>
  <p>9.3. Estacionamento conveniado, se utilizado, poderá ser cobrado à parte.</p>

  <h3>CLÁUSULA 10 — FORO</h3>
  <p>10.1. Fica eleito o foro da Comarca de Curitiba/PR.</p>

  <h3>CLÁUSULA 11 — DISPOSIÇÕES FINAIS</h3>
  <p>11.1. Este instrumento constitui o acordo integral entre as partes sobre o objeto.</p>
  <p>11.2. A tolerância não implica novação ou renúncia.</p>
  <p>11.3. O CONTRATANTE declara ter lido e compreendido todas as cláusulas, em especial a Cláusula 4.</p>

  <p style="margin-top:28px">Curitiba/PR, ${d.dataAssinatura}.</p>

  <div class="assinaturas">
    <div class="assinatura">
      <strong>Life Consultoria Imobiliária</strong><br>
      CNPJ 22.044.720/0001-91<br>
      p/ Raquel Celoni Dombroski<br>
      <em>CONTRATADA</em>
    </div>
    <div class="assinatura">
      <strong>${d.razaoSocial}</strong><br>
      ${d.documento}<br>
      ${d.tipoPessoa === 'pj' ? d.representante + '<br>' : ''}
      <em>CONTRATANTE</em>
    </div>
  </div>
</body>
</html>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contratoForm');
  const qtdMagnolia = document.getElementById('qtdMagnolia');
  const valorInput = document.getElementById('valorMensal');
  const resumoBox = document.getElementById('resumoEspacos');
  const resumoLista = document.getElementById('resumoLista');
  const tipoPrazo = document.getElementById('tipoPrazo');
  const grupoDataFim = document.getElementById('grupoDataFim');
  const dataFim = document.getElementById('dataFim');
  const tipoPessoa = document.getElementById('tipoPessoa');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  const params = new URLSearchParams(window.location.search);
  const salaParam = (params.get('sala') || '').split(',').map((s) => s.trim()).filter(Boolean);
  salaParam.forEach((key) => {
    if (key === 'magnolia') {
      qtdMagnolia.value = Math.max(1, parseInt(qtdMagnolia.value, 10) || 0);
      return;
    }
    const checkbox = form.querySelector(`input[name="salas"][value="${key}"]`);
    if (checkbox) checkbox.checked = true;
  });

  const syncResumo = () => {
    const itens = getSelectedItens(form);
    const total = itens.reduce((sum, item) => sum + item.subtotal, 0);

    if (!itens.length) {
      resumoBox.hidden = true;
      resumoLista.innerHTML = '';
      valorInput.value = '';
      return;
    }

    resumoBox.hidden = false;
    resumoLista.innerHTML = itens.map((item) => {
      const qtdTxt = item.qtd > 1 ? ` × ${item.qtd}` : '';
      return `<li><strong>${item.nome}</strong>${qtdTxt} — ${item.tipo} · ${item.area} · R$ ${item.subtotalTexto}</li>`;
    }).join('');
    valorInput.value = formatBRL(total);
  };

  form.querySelectorAll('input[name="salas"]').forEach((el) => {
    el.addEventListener('change', syncResumo);
  });
  qtdMagnolia.addEventListener('input', syncResumo);
  syncResumo();

  tipoPrazo.addEventListener('change', () => {
    const determinado = tipoPrazo.value === 'determinado';
    grupoDataFim.hidden = !determinado;
    dataFim.required = determinado;
  });

  const syncTipoPessoa = () => {
    document.getElementById('representante').required = tipoPessoa.value === 'pj';
  };
  tipoPessoa.addEventListener('change', syncTipoPessoa);
  syncTipoPessoa();

  document.getElementById('telefoneContrato').addEventListener('input', (e) => {
    e.target.value = maskPhone(e.target.value);
  });

  document.getElementById('btnLimpar').addEventListener('click', () => {
    form.reset();
    grupoDataFim.hidden = true;
    qtdMagnolia.value = 0;
    syncResumo();
    syncTipoPessoa();
  });

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('nav__menu--open'));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const itens = getSelectedItens(form);
    if (!itens.length) {
      alert('Selecione ao menos uma sala ou informe a quantidade de estações Magnólia.');
      return;
    }
    if (tipoPrazo.value === 'determinado' && !dataFim.value) {
      alert('Informe a data de término do prazo determinado.');
      return;
    }
    const data = getFormData(form);
    const html = buildContractHTML(data);
    const win = window.open('', '_blank');
    if (!win) {
      alert('Permita pop-ups para gerar o contrato.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  });
});
